import express from 'express'
import db from '../db.js'
const router = express.Router();

router.route("/addproduct").post(async(req,res)=>{
    const {name,brand_name, desc ,ram ,rom , color ,battery , processor , camara_desc , front_camera, rear_camera, display_desc  , size , network , wifi , nfc , os} = req.body
    console.log(name,brand_name, desc ,ram ,rom , color ,battery , processor , camara_desc , front_camera, rear_camera, display_desc  , size , network , wifi , nfc , os)
    try{
        const connection = db.getConnection();
        connection.beginTransaction((err)=>{
            if(err){
                return connection.rollback(() => {
                    console.error('Error executing SQL1:', err);
                    connection.release();
                    throw err
            })
            }
        connection
        }
            )
    }
    catch(err){
        return res.status(400).json(err)
    }
})

export default router