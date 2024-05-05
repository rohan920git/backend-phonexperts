// const express = require("express");
import express from 'express'
// require('dotenv').config();
import dotenv from 'dotenv'
dotenv.config();


// const db = require('../db');
import db from '../db.js'
const router = express.Router();
// const { body, validationResult } = require('express-validator');
import {body ,validationResult} from 'express-validator';
// const jwt = require("jsonwebtoken");
import jwt from 'jsonwebtoken'
// const bcrypt = require("bcrypt");
import bcrypt from 'bcrypt'

const jwtsec =process.env.JWTSEC;
const getCurrentTimestamp = () => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  return timestamp;
};
router.post("/createuser",
[
body("name").isLength({min:2}),
body("username").isLength({min:3}),
body("email").isEmail(),
body("password").isLength({min:6})
],
async (req , res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ success:false , errors: errors.array() , message:"Password Length must be more than 6"});
    }
    let email = req.body.email;
    const emailexist = await new Promise((resolve , reject) =>{
      
    
    db.query('SELECT email FROM users WHERE email = ?',[email],(err,result)=>{
        if(err){
           reject(err);
        }
        else{
          resolve(result.length !== 0);
       }
    })
  })
   if(emailexist){
    return res.json({success:false,message:"email already exist"});
   }
   const phoneexist = await new Promise((resolve,reject)=>{
    db.query('SELECT email FROM users WHERE phone_number = ?',[req.body.phonenumber],(err,result)=>{
      if(err){
          reject(err);
      }
      else{
       
       resolve(result.length !== 0)
      }
  })

   })
   if(phoneexist){
    return res.json({success:false, message:"Phone number already exist"});
   }
   
    // const userdata = await User.findOne({email});
    // if(userdata){
    //   return res.status(400).json({success:false,
    //   message:"user already exists"})
    // }
    const salt = await bcrypt.genSalt(10);
    let secpassword = await bcrypt.hash(req.body.password,salt);
   
    
    const timestamp = getCurrentTimestamp();
    db.query('insert into users (name_,user_name, email , password_,created,modified,phone_number)values(?,?,?,?,?,?,?);',[req.body.name,req.body.username,email,secpassword,timestamp,timestamp,req.body.phonenumber],(err,result)=>{
        if(err){
           return res.json({success:false, message:err});
        }
        else{
           return res.json({success:true ,message:"account successfully Created" });
        }
    });
//   try{ 
//     console.log(req.body.name , req.body.email)
//     //   await User.create({
//     //       name:req.body.name,
//     //       email:req.body.email,
//     //       password:secpassword
//     //   })
//       res.json({success:true}) 
//   }
//   catch(error){
//     console.log(error)
//     res.json({success:false}) 
//   }
  }

);
router.post("/login",[
  body("email").isEmail(),
  body("password").isLength(6)
], async (req, res)=>{
 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.status(401).json({success:false,"error" : errors,message:"Credentials are not in right formate"})
    }
    console.log("here2")
  
    db.query('SELECT * FROM users WHERE email = ?',[req.body.email], async(err,result)=>{
      if(err){
          console.log(err);
          res.json({success:false,"error":err});
      }
      if( result.length === 0 ){
        return res.status(400).json({success:false , message:"email does not exist"});

      } 
      console.log("here4")
     const user = result[0];
     let pwdcompare =  await bcrypt.compare(req.body.password , user.password_);
     if(!(pwdcompare)){
       
       return res.status(400).json({error : "enter correct password" ,
                                     message : "password is worong",
                                     success:false});
     }
     const token =  jwt.sign({id: user.id, username: user.username} , jwtsec);
     console.log("here5")
     res.cookie("authCookie",token,{})
     res.json({ success: true, token: token });
    }
  )




})
export default router;