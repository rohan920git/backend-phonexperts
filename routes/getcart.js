// const express = require("express");
import express from 'express'
// const db = require('../db');
import db from '../db.js'
const router = express.Router();
// const jwt = require("jsonwebtoken");
import jwt from 'jsonwebtoken'

// require("dotenv").config()
import dotenv from 'dotenv'
dotenv.config()
const jwtsec = process.env.JWTSEC;
router.get('/cart_items/:token', async(req,res)=>{
    const token = req.params.token;
    let tokendata;
     jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
            res.json(err);
        }
        else{
            tokendata = code;
        }

     })
    const user_id = tokendata.id;
    db.query(`select cart_items.product_id , cart_items.quantity from carts inner join cart_items on carts.cart_id = cart_items.cart_id and carts.user_id =${user_id} `,(err , result)=>{
       if(err){
        res.status(100).json({sucess:false,
                   "err":err});
       }
       else{
        res.json(result).status(200);
       }

    })
    res.status(200);
})
router.post('/addTocart/:token',(req,res)=>{
    const product_id = req.body.product_id;
    const token = req.params.token;
    let  tokendata;
    jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
        res.status(100).json({success:false,
                   "err":err});
     
        }
        else{
            tokendata =  code;
        }

     })
    const user_id = tokendata.id;
   //creating transactions
   db.getConnection(async (err,connection)=>{
    if(err) {
            
      res.json(err);
      return res.status(100).json({success:false,
        "err":err});
   }
     connection.beginTransaction((err)=>{
        if(err){
            connection.rollback()
                console.log(err);
                return res.status(100).json({success:false,
                    "err":err});
            
        }
     
     let c_id ;
      connection.query(`select cart_id from carts where user_id = ${user_id}`,(err,result)=>{
       
          if(err){
             
            console.log(err);
            connection.rollback()
            return res.status(100).json({success:false,
                "err":err});
        }
        if(result.length > 0){
            c_id = result[0].cart_id;
         
        connection.query(`insert into cart_items (cart_id , product_id, quantity) values (${c_id},${product_id},${1})`,(err,result)=>{
       
          if(err){
              connection.rollback()
              console.log(err);
              return res.status(100).json({success:false,
                 "err":err});
           }
           connection.commit((err)=>{
             if(err){
                 
              connection.rollback()
              console.log(err);
              return res.status(100).json({success:false,
                  "err":err});
             }
             res.status(200).json("completed");
             connection.release();
           });
        })
            
        } 
        else{
          
            connection.query(`insert into carts (user_id) values (${user_id})`,(err,result)=>{
                if(err){
             
                    connection.rollback()
                console.log(err);
                return res.status(100).json({success:false,
                    "err":err});
                }
                 c_id = result.insertId;
              
        connection.query(`insert into cart_items (cart_id , product_id, quantity) values (${c_id},${product_id},${1})`,(err,result)=>{
       
          if(err){
              connection.rollback()
              console.log(err);
              return res.status(100).json({success:false,
                 "err":err});
           }
           connection.commit((err)=>{
             if(err){
                 
              connection.rollback()
              console.log(err);
              return res.status(100).json({success:false,
                  "err":err});
             }
             res.status(200).json({success:true});
             connection.release();
           });
        })
            })
        }
           
    
      } )
     
      
})
   
 

})
})
router.post('/removeFromCart/:token',(req ,res )=>{

    const product_id = req.body.product_id;
    const token = req.params.token;
    let  tokendata;
    jwt.verify(token,jwtsec,(err,code)=>{
        if(err)
        {
        res.status(100).json({success:false,
                   "err":err});
     
        }
        else{
            tokendata =  code;
        }

     })
    const user_id = tokendata.id;
    db.query(`select cart_id from carts where user_id = ${user_id}`,(err,result)=>{
        if(err){
            return res.json({success:false,"err":err});
        }
        const cart_id = result[0].cart_id;
        db.query(`delete from cart_items where cart_id = ${cart_id} and product_id = ${product_id}`,(err1,result1)=>{
            if(err){
                return res.json({success:false,err:err});
            }
            return res.json({success:true});
        })

    })
})
export default router;