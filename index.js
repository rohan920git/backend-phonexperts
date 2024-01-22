// const express = require('express');
import express  from 'express';
// const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
// const mysql = require("mysql");
import cors from 'cors'
import bp from 'body-parser'
// const db = require('./db')

const app = express();
// const users = require('./routes/createUser')
import users from "./routes/createUser.js"
// const getdata  = require('./routes/getdata')
import getdata from "./routes/getdata.js"
// const getdetails  = require('./routes/getdetails')
import getdetails from "./routes/getdetails.js"
// const cart_items = require('./routes/getcart')
import cart_items from "./routes/getcart.js"
// const userinfo  = require('./routes/getuserinfo')
import userinfo from "./routes/getuserinfo.js"
// const storage  = require('./middleware/multer.storage')
import storage from "./middleware/multer.storage.js"

// const multer  = require('multer')
import { parse } from 'dotenv';
// const {uploadOnClodinary} = require("./utility/cloudinary.js")
import multer from 'multer';
import { uploadOnCloudinary } from './utility/uploadOncloudinary.js';
const upload = multer({ storage })
const PORT  = 5000;
app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin","http://localhost:3000")
    res.header(
        "Allow-Control-Allow-Headers",
        "Origin, X-Requested-With,Content-Type,Accept"
    )
    next();
})
// allow Cross-domain requests 

 
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser())


app.use(bp.json())
app.use(express.urlencoded({extended:false}));
app.use('/',users);
app.use('/',getdata);
app.use('/',getdetails);
app.use('/',cart_items);
app.use('/',userinfo);
app.post('/profileupload',upload.single('image'),async(req, res)=>{
console.log(req.body);
console.log(req.file);
const response = await uploadOnCloudinary(req.file.path);
console.log(response)
return res.json("photo saved");
})
app.listen(PORT, ()=>{
    console.log("server started");
})