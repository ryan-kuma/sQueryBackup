/*
 * @Descripttion: 
 * @version: 
 * @Author: Zhe Yang
 * @Date: 2021-05-31 13:12:00
 * @LastEditors: Zhe Yang
 * @LastEditTime: 2021-06-02 14:18:06
 */
#pragma once
#include <map>

extern "C"
{
#include <sqlite3.h>
}

typedef struct _DBConn
{
    sqlite3 *dbc;
} DBConn;

typedef struct _DBResult
{
    bool status;
    char **result;
    int nRow;
    int nColumn;
} DBResult;

class SQLiteProxy
{

private:
    std::map<std::string, DBConn> pxs;

    DBConn OpenSQLite(const std::string &dbname)
    {
        std::map<std::string, DBConn>::iterator it = pxs.find(dbname);
        if (it == pxs.end())
        {
            DBConn dbp;
            dbp.dbc = NULL;

            int res = sqlite3_open(dbname.c_str(), &dbp.dbc);
            if (res != SQLITE_OK)
            {
                exit(-1);
            }
            pxs.insert(std::map<std::string, DBConn>::value_type(dbname, dbp));
            return dbp;
        }
        else
        {
            return it->second;
        }
    }

public:
    SQLiteProxy()
    {
    }

    ~SQLiteProxy()
    {
        int status;
        for (std::map<std::string, DBConn>::iterator it = pxs.begin(), ite = pxs.end(); it != ite; it++)
        {
            status = sqlite3_close(it->second.dbc);
            if (status != SQLITE_OK)
            {
                exit(-1);
            }
        }
        pxs.clear();
    }

    //create|insert|update|delete ...
    bool Exec(const std::string &dbname, const std::string &sql, int (callback)(void*, int, char**, char**))
    {
        int res;
        char *err = NULL;
        DBConn db = OpenSQLite(dbname.c_str());

        res = sqlite3_exec(db.dbc, sql.c_str(), callback, 0, &err);
        if (res != SQLITE_OK)
        {
            return false;
        }
        return true;
    }

    //select
    DBResult Query(const std::string &dbname, const std::string &sql)
    {
        int res;
        char *err = NULL;
        DBConn db = OpenSQLite(dbname);
        DBResult dbr;

        res = sqlite3_get_table(db.dbc, sql.c_str(), &dbr.result, &dbr.nRow, &dbr.nColumn, &err);
        if (res == SQLITE_OK)
        {
            dbr.status = true;
            return dbr;
        }
        dbr.status = false;
        return dbr;
    }
};
