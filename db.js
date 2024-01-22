// const mysql = require("mysql")
import mysql from "mysql"
const dbcofig= {
    host :'localhost',
    user : 'root',
    password: 'rohanb158',
    database:'phonexpert'
}
const db = mysql.createPool(dbcofig);

export default db;