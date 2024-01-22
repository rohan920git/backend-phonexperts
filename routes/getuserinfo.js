// const express = require("express");
import express from 'express';
// const db = require('../db');
import db from "../db.js"
const router = express.Router();
// const jwt = require("jsonwebtoken");
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import multer from 'multer';
import {uploadOnCloudinary } from '../utility/uploadOncloudinary.js';
import { verifyJwt} from '../utility/verify.jwt.js'
import storage from '../middleware/multer.storage.js';
const upload = multer({ storage })
dotenv.config()
// require("dotenv").config()
const jwtsec =process.env.JWTSEC;
router.get('/userprofile/:token',async(req,res)=>{
   const token = req.params.token;
   let tokendata;

     jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
           return res.json(err);
        }
        else{
            tokendata = code;
        }

     })
    const user_id = tokendata.id;


  db.query("select name_,user_name,email,phone_number,image_url from users left outer join  profile_photo_tbl on users.id = profile_photo_tbl.user_id where users.id = ?",[user_id],(err,result)=>{
    if(err){
       return res.status(100).json({success:false,
        message:err});
    }
    else{
        res.json(result);
    }
  })
})
router.put("/savename/:token",async(req,res)=>{
   const token = req.params.token;
   let tokendata;
   const name = req.body.name;
     jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
           return res.json(err);
        }
        else{
            tokendata = code;
        }

     })
    const user_id = tokendata.id;
    db.query("update users set name_=? where id = ?",[name,user_id],async(err, result)=>{
           if(err){
            return res.json({success:false,message:err.sqlMessage});
           }
          return res.json({sueccess:true,message:"name updataed successfully",result:result});
    })
})
router.put("/saveusername/:token",async(req,res)=>{
   const token = req.params.token;
   let tokendata;
   const username = req.body.username;
     jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
           return res.json(err);
        }
        else{
            tokendata = code;
        }

     })
    const user_id = tokendata.id;
    db.query("update users set user_name = ? where id = ?",[username,user_id],async(err, result)=>{
           if(err){
            return res.json({success:false,message:err.sqlMessage});
           }
          return res.json({sueccess:true,message:"username updataed successfully",result:result});
    })
})
router.post("/saveprofile/:token",upload.single('image'),async(req, res)=>{
   
   const response = await uploadOnCloudinary(req.file.path);

   const token = req.params.token;
   const data = await verifyJwt(token);

   if(!data){

      return res.status(100).json({sueccess:false,message:"user not found"})
   }
   const exists = await checkifuserexsit(data.id);
   if(exists === null){
  
     return res.json({success:false,message:"some internal error"});
   }

   if(!exists ){
   try{
      
      
      const database_response = await db.query('insert into profile_photo_tbl values (?,?)',[data.id,response.url])
  
     return res.json({success:true,message:"photo uploaded successfully"})
   } catch(err){
   
      return res.status(100).json({success:false,message:err});
   }
}
  else {
   try{
      const database_response = await db.query('update profile_photo_tbl set image_url = ? where user_id = ?',[response.url,data.id])
 
      return res.json({success:true,message:"photo updated successfully"})
    
    } catch(err){
       return res.status(100).json({success:false,message:err});
    }

  }
})
const checkifuserexsit = (user_id)=>{
    const exist = new Promise((resolve, reject)=>{
      db.query("select * from profile_photo_tbl where user_id = ?" , [user_id],(err, result)=>{
         if(err){
            reject(err);
         }
         else{

            resolve(result.length !== 0 )
         }
      })
    })
return exist;

}
export default router;