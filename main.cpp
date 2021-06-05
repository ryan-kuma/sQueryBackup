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
#include "json.hpp"

void handlerRequest(const httplib::Request& req, httplib::Response& rsp)
{
    //接收json
    if (req.has_param("sqltext")) {
        cout<<req.get_param_value("sqltext")<<endl; 
    }

    //返回json
    nlohmann::json jsdic;
    jsdic["status"] = 200;

    vector<std::string> svec;
    std::string str = "dululu";
    for (int i = 0; i < 5; i++) {
        str += "lulu";
        svec.push_back(str);
    } 

    jsdic["result"] = svec;
    std::string s = j.dump();
    //cout<<s<<endl;
    rsp.set_content(s, "application/json"); 
}

// void queryHandler
static int callback(void *NotUsed, int argc, char **argv, char **azColName) {
    int i;
    for (i = 0; i < argc; i++)
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");

    printf("\n");
    return 0;
}

int main()
{

    // HTTP
    httplib::Server svr;

    SQLiteProxy proxy;
    /*
    char SQL_STMT[]="CREATE TABLE COMPANY ( \
    ID INT PRIMARY KEY NOT NULL, \
    NAME TEXT NOT NULL, \
    AGE INT NOT NULL, \
    ADDRESS CHAR(50), \
    SALARY REAL ); \
    INSERT INTO COMPANY VALUES ( 1, 'Kris', 27, 'California', 16000.00 ); \
    SELECT * FROM COMPANY;";

    bool ret = proxy.Exec("testdb", SQL_STMT, callback); 
    */

    int ret = svr.set_mount_point("/", "../templates");
   
    //处理查询请求
    svr.Post("/search", handlerRequest);
    
    svr.listen("0.0.0.0", 8088);
    return 0;
}
