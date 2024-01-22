// const express = require("express");
import express from 'express'
// const db = require('../db');
import db from '../db.js'

const router = express.Router();
router.get("/getdata", async (req,res)=>{
 db.query("SELECT * FROM product_tbl",(err,data)=>{
    if(err){
        return res.json({"error":err})
    }
    else{
        // return res.json(res)
      res.json(data)
    }
 })
})
export default router;