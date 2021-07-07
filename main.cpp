/*
 * @Descripttion: 
 * @version: 
 * @Author: Zhe Yang
 * @Date: 2021-05-30 16:09:58
 * @LastEditors: Zhe Yang
 * @LastEditTime: 2021-06-02 14:27:22
 */

#define CPPHTTPLIB_OPENSSL_SUPPORT

#include <gflags/gflags.h>
#include <httplib.h>
#include <vector>
#include <string>
#include "sqliteproxy.h"
#include "openssl/sha.h"
#include "openssl/rsa.h"
#include "openssl/pem.h"

#include "json.hpp"

#define KEY_LENGTH 2048 //密钥长度

static  std::string private_key = ""; //私钥
static  std::string public_key = ""; //公钥

//返回认证数据
void handleAuthentication(const httplib::Request& req, httplib::Response& rsp);

std::string rsa_pri_encrypt(std::string data);

//处理查询表下所有列名的请求
void  handlerShowColumns(const httplib::Request& req, httplib::Response& rsp);
//具体使用sqlite3处理查询表下所有列名的请求
int sqlHandleShowColumns(void *data, int args_num, char **argv, char **azColName);

//精确查询显示数据
void handleAccurateSelect(const httplib::Request& req, httplib::Response& rsp);
//复合查询显示数据
void handleComplexSelect(const httplib::Request& req, httplib::Response& rsp);

//聚集查询显示数据
void handleAggregateSelect(const httplib::Request& req, httplib::Response& rsp);

//分页显示数据
void handlePageSelect(const httplib::Request& req, httplib::Response& rsp);

//使用sqlite3执行sql语句
int sqlHandleQuery(void *data, int args_num, char **argv, char **azColName);

//使用sqlite3查询计数值
int sqlHandleCount(void *data, int args_num, char **argv, char **azColName);

int main()
{

    // HTTP
    httplib::Server svr;

    int ret = svr.set_mount_point("/", "../templates");

    svr.Post("/Authentication",  handleAuthentication);
    svr.Post("/showColumns", handlerShowColumns);
    svr.Post("/accurateSelect", handleAccurateSelect);
    svr.Post("/complexSelect", handleComplexSelect);
    svr.Post("/rangeSelect",  handleAccurateSelect);
    svr.Post("/aggregateSelect", handleAggregateSelect);
    svr.Post("/fuzzySelect",   handleAccurateSelect);
    svr.Post("/pageSelect", handlePageSelect);

    svr.listen("0.0.0.0", 8088);
    return 0;
}
    

void handleAuthentication(const httplib::Request& req, httplib::Response& rsp)
{
    nlohmann::json jsdic;
    RSA *keypair = RSA_generate_key(KEY_LENGTH, RSA_3, NULL, NULL);

    char *pri_key = NULL;
    char *pub_key = NULL;

    BIO *pri = BIO_new(BIO_s_mem());
    BIO *pub = BIO_new(BIO_s_mem());


    PEM_write_bio_RSAPrivateKey(pri, keypair, NULL, NULL, 0, NULL, NULL);
    PEM_write_bio_RSAPublicKey(pub, keypair);

    size_t pri_len = BIO_pending(pri);
    size_t pub_len = BIO_pending(pub);

    pri_key = (char*) malloc(pri_len +1);
    pub_key = (char*) malloc(pub_len +1);

    BIO_read(pri, pri_key, pri_len);
    BIO_read(pub, pub_key, pub_len);

    pri_key[pri_len] = '\0';
    pub_key[pub_len] = '\0';

    //设置全局变量
    private_key = pri_key;
    public_key = pub_key;

    RSA_free(keypair);
    BIO_free_all(pub);
    BIO_free_all(pri);
    free(pri_key); 
    free(pub_key);

    jsdic["status"] = 200;
    jsdic["publickey"] = public_key;

    std::string s = jsdic.dump();
    rsp.set_content(s, "application/json");
}

void  handlerShowColumns(const httplib::Request& req, httplib::Response& rsp)
{
    nlohmann::json jsdic;
    
    std::string tableName = "";
    if (req.has_param("tablename")) {
        tableName = req.get_param_value("tablename"); 

        SQLiteProxy *proxy = new SQLiteProxy;

        std::string databaseName = "../database/twitter.db";
        std::string SQL_STMT = "select * from " + tableName + " LIMIT 1";
        std::vector<std::string> *psvec = new std::vector<std::string>(0);
        
        bool ret = proxy->Exec(databaseName, SQL_STMT, sqlHandleShowColumns, psvec);
        if (psvec->size() == 0) {
            jsdic["status"] = 310;
        } else {
            std::vector<std::string> svec(psvec->begin(), psvec->end());
            jsdic["status"] = 200;    
            jsdic["result"] = svec;
        }

        delete proxy;

    } 
    else {
        jsdic["status"] = 400;     
    }

    std::string data = jsdic.dump();
    std::string encryptedData = rsa_pri_encrypt(data);
    jsdic["data"] = data;
    jsdic["encrypteddata"] = encryptedData;
    
    std::string s = jsdic.dump();

    rsp.set_content(s, "application/json");
}

int sqlHandleShowColumns(void *data, int args_num, char **argv, char **azColName)
{
    std::vector<std::string> *colNameVec= (std::vector<std::string>*) data;

    int i;
    for (i = 0; i < args_num; i++) {
        std::string colName(azColName[i]);
        colNameVec->push_back(colName);
    }
    
    return 0;
}

void handleAccurateSelect(const httplib::Request& req, httplib::Response& rsp)
{
    nlohmann::json jsdic;
    jsdic["status"] = 320;  //异常状态
    std::string tableName = "";
    std::string strColNames = "";
    std::string strColConditions = "";
    if (req.has_param("tablename") && req.has_param("colnames")) {
        tableName = req.get_param_value("tablename");
       
        //解析colnames
        strColNames = req.get_param_value("colnames");
        nlohmann::json jparsename = nlohmann::json::parse(strColNames);
        std::vector<std::string> svec = jparsename.get<std::vector<std::string>>();
        
        strColNames = *svec.begin();
        for(std::vector<std::string>::iterator iter = svec.begin() + 1; iter != svec.end(); iter++) {
            strColNames += ", " + *iter;
        }

        //解析colcondition
        if (req.has_param("colconditions")) {
            strColConditions = req.get_param_value("colconditions"); 
            nlohmann::json jparseCond = nlohmann::json::parse(strColConditions);
            std::vector<std::string> ssvec = jparseCond.get<std::vector<std::string>>();
            
            if (!ssvec.empty()) {
                strColConditions = *ssvec.begin();
                for(std::vector<std::string>::iterator iter = ssvec.begin() + 1; iter != ssvec.end(); iter++) {
                    strColConditions += " and " + *iter;
                }
            } else {
                strColConditions = "";
            }
        }

        //执行sql精确查询
        SQLiteProxy *proxy = new SQLiteProxy();

        std::string databaseName = "../database/twitter.db";
        //查询计数值
        std::string SQL_COUNT = " select count(*) from " + tableName; 
        //查询具体数据
        std::string SQL_STMT = "select "+ strColNames +" from " + tableName;
        if (strColConditions != "") {
            SQL_STMT = SQL_STMT + " where " + strColConditions;
            SQL_COUNT  = SQL_COUNT + " where " + strColConditions;
        }

        //获得计数值
        std::string count = "0";
        bool ret = proxy->Exec(databaseName, SQL_COUNT,  sqlHandleCount, &count);
        std::cout<<"count="<<count<<std::endl;

        //只查询前20行
        std::string strSqlStmt = SQL_STMT;
        SQL_STMT = SQL_STMT + " LIMIT 0, 20 ";

        std::vector<std::string> *psvec = new std::vector<std::string>(1);
        
        std::cout<<SQL_STMT<<std::endl;
        ret = proxy->Exec(databaseName, SQL_STMT,  sqlHandleQuery, psvec);
        if (psvec->size() == 0) {
            jsdic["status"] = 310;  //empty data
        } else {
            std::vector<std::string> resvec(psvec->begin(), psvec->end());
            jsdic["status"] = 200;   //success 
            jsdic["count"] = count;
            jsdic["result"] = resvec;
            jsdic["sqlstmt"] = strSqlStmt; 
        }

        delete proxy;

    }

    std::string data = jsdic.dump();
    std::string encryptedData = rsa_pri_encrypt(data);
    jsdic["data"] = data;
    jsdic["encrypteddata"] = encryptedData;

    std::string s =jsdic.dump();
//    std::cout<<"stding="<<s<<std::endl;
    rsp.set_content(s, "application/json");
}

void handleComplexSelect(const httplib::Request& req, httplib::Response& rsp) 
{
    nlohmann::json jsdic;
    jsdic["status"] = 320; //异常状态
    std::string table1Name = "";
    std::string table2Name = "";
    std::string strColNames = "";
    std::string strJoinCondition = "";

    if (req.has_param("table1name") && req.has_param("table2name")) {
        table1Name = req.get_param_value("table1name");
        table2Name = req.get_param_value("table2name");

        //解析colnames
        strColNames = req.get_param_value("colnames");
        nlohmann::json jparsename = nlohmann::json::parse(strColNames);
        std::vector<std::string> svec = jparsename.get<std::vector<std::string>>();
        
        strColNames = *svec.begin();
        for(std::vector<std::string>::iterator iter = svec.begin() + 1; iter != svec.end(); iter++) {
            strColNames += ", " + *iter;
        }
        
        //解析joincondition
        if (req.has_param("joincondition")) {
            strJoinCondition = req.get_param_value("joincondition");
        }

        //执行sql复合查询
        SQLiteProxy *proxy = new SQLiteProxy();

        std::string databaseName = "../database/twitter.db";

        //查询计数值
        std::string SQL_COUNT = " select count(*) from " + table1Name + " , " + table2Name;
        //查询具体数据
        std::string SQL_STMT = "select "+ strColNames +" from " + table1Name + " , " + table2Name;
        if (strJoinCondition != "") {
            SQL_STMT = SQL_STMT + " where " + strJoinCondition; 
            SQL_COUNT = SQL_COUNT + " where " + strJoinCondition; 
        }

        //获得计数值
        std::string count = "0";
        bool ret = proxy->Exec(databaseName, SQL_COUNT,  sqlHandleCount, &count);
        std::cout<<"count="<<count<<std::endl;
        
        //只查询前20行
        std::string strSqlStmt = SQL_STMT;
        SQL_STMT = SQL_STMT + " LIMIT 0,20 ";

        std::vector<std::string> *psvec = new std::vector<std::string>(1);
        
        std::cout<<SQL_STMT<<std::endl;
        ret = proxy->Exec(databaseName, SQL_STMT,  sqlHandleQuery, psvec);
        if (psvec->size() == 0) {
            jsdic["status"] = 310;  //empty data
        } else {
            std::vector<std::string> resvec(psvec->begin(), psvec->end());
            jsdic["status"] = 200;   //success 
            jsdic["count"] = count;
            jsdic["result"] = resvec;
            jsdic["sqlstmt"] = strSqlStmt;
        }

        delete proxy;
    }

    std::string data = jsdic.dump();
    std::string encryptedData = rsa_pri_encrypt(data);
    jsdic["data"] = data;
    jsdic["encrypteddata"] = encryptedData;

    std::string s =jsdic.dump();
    rsp.set_content(s, "application/json");
}

void handleAggregateSelect(const httplib::Request& req, httplib::Response& rsp)
{
    nlohmann::json jsdic;
    jsdic["status"] = 320; //异常状态
    std::string tableName = "";
    std::string strColNames = "";

    if (req.has_param("tablename")){
        tableName = req.get_param_value("tablename");

        //解析colnames
        strColNames = req.get_param_value("colnames");
        nlohmann::json jparsename = nlohmann::json::parse(strColNames);
        std::vector<std::string> svec = jparsename.get<std::vector<std::string>>();
        
        strColNames = *svec.begin();
        for(std::vector<std::string>::iterator iter = svec.begin() + 1; iter != svec.end(); iter++) {
            strColNames += ", " + *iter;
        }
        
        //执行sql复合查询
        SQLiteProxy *proxy = new SQLiteProxy();

        std::string databaseName = "../database/twitter.db";

        //查询具体数据
        std::string SQL_STMT = "select "+ strColNames +" from " + tableName;

        //只查询前20行
        SQL_STMT = SQL_STMT + " LIMIT 20";

        std::vector<std::string> *psvec = new std::vector<std::string>(1);
        
        std::cout<<SQL_STMT<<std::endl;
        bool ret = proxy->Exec(databaseName, SQL_STMT,  sqlHandleQuery, psvec);
        if (psvec->size() == 0) {
            jsdic["status"] = 310;  //empty data
        } else {
            std::vector<std::string> resvec(psvec->begin(), psvec->end());
            jsdic["status"] = 200;   //success 
            jsdic["result"] = resvec;
        }

        delete proxy;
    }

    std::string data = jsdic.dump();
    std::string encryptedData = rsa_pri_encrypt(data);
    jsdic["data"] = data;
    jsdic["encrypteddata"] = encryptedData;

    std::string s =jsdic.dump();
    rsp.set_content(s, "application/json");
}

void handlePageSelect(const httplib::Request& req, httplib::Response& rsp)
{
    nlohmann::json jsdic;
    jsdic["status"] = 320;
    std::string sqlStmt = "";
    std::string startquery = "0";
    if (req.has_param("startquery")){
        startquery = req.get_param_value("startquery");        
        std::cout<<"page="<<startquery<<std::endl;
    }
    if (req.has_param("sqlstmt")) {
        sqlStmt = req.get_param_value("sqlstmt");
        std::cout<<"sql="<<sqlStmt<<std::endl; 
    }
    
    SQLiteProxy *proxy = new SQLiteProxy();

    std::string databaseName = "../database/twitter.db";

    //查询具体数据
    std::string SQL_STMT = sqlStmt + " LIMIT " + startquery + " , 20 ";


    std::vector<std::string> *psvec = new std::vector<std::string>(1);
    
    std::cout<<"sqlstmt="<<SQL_STMT<<std::endl;
    bool ret = proxy->Exec(databaseName, SQL_STMT,  sqlHandleQuery, psvec);
    if (psvec->size() == 0) {
        jsdic["status"] = 310;  //empty data
    } else {
        std::vector<std::string> resvec(psvec->begin(), psvec->end());
        jsdic["status"] = 200;   //success 
        jsdic["result"] = resvec;
    }

    delete proxy;

    std::string data = jsdic.dump();
    std::string encryptedData = rsa_pri_encrypt(data);
    jsdic["data"] = data;
    jsdic["encrypteddata"] = encryptedData;

    std::string s =jsdic.dump();
    rsp.set_content(s, "application/json");

}

int sqlHandleQuery(void *data, int args_num, char **argv, char **azColName)
{
    std::vector<std::string> * dataVec = (std::vector<std::string>*) data;
    int i;
    std::vector<std::string> colNameVec;
    std::vector<std::string> colDataVec;
    for (i = 0; i < args_num; i++) {
        //头次查询增加列名 
        if (dataVec->size() == 1) {
            std::string colName(azColName[i]);
            colNameVec.push_back(colName);
        }

        std::string colData(argv[i]?argv[i]:"NULL");
        colDataVec.push_back(colData);
    }
    if (dataVec->size() == 1) {
        nlohmann::json jsColData;
        jsColData["colname"] = colNameVec;
        std::string strColData = jsColData.dump();
        *dataVec->begin() = strColData;
    }

    nlohmann::json jsRowData;
    jsRowData["rowdata"] = colDataVec;
    std::string strRowData = jsRowData.dump();
    dataVec->push_back(strRowData);

    return 0;
}

int sqlHandleCount(void *data, int args_num, char **argv, char **azColName) 
{
    int i;
    std::string *count = (std::string *)data;
    *count = argv[0];
    return 0;
}

std::string rsa_pri_encrypt(std::string data)
{
    //generate sha256 hash
    unsigned char shaStr[33] = {0};
    SHA256((const unsigned char *)data.c_str(), data.length(), shaStr);
    std::string encodedStr = std::string((const char *)shaStr);

    //private key encrypt
    BIO *keybio = BIO_new_mem_buf((unsigned char *)private_key.c_str(), -1);
    RSA *rsa = PEM_read_bio_RSAPrivateKey(keybio, &rsa, NULL, NULL);

    int len = RSA_size(rsa);
    char *encryptedText = (char*) malloc(len+1);
    memset(encryptedText, 0, len + 1);

    int ret = RSA_private_encrypt(encodedStr.length(), (const unsigned char*)encodedStr.c_str(), (unsigned char*)encryptedText, rsa, RSA_PKCS1_PADDING);
    std::string encryptedStr = encryptedText;

    BIO_free_all(keybio);
    free(encryptedText);
    RSA_free(rsa);

    return encryptedStr;
}
