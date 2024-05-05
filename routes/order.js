import express from 'express'
import Razorpay from 'razorpay';
import crypto from 'crypto'
import dotenv from 'dotenv'
import db from '../db.js'
import jwt from 'jsonwebtoken'
import { Result } from 'express-validator';


dotenv.config();
const router = express.Router();
const token_sec = process.env.JWTSEC;
router.route("/generateorder").post(async(req,res)=>{
    const{amount,phone_data, email ,pin, name, address,token} = req.body
 
    let data;
    try{
        console.log(token_sec)
        data = jwt.verify(token,token_sec);

       }
       catch(err){
       return res.status(401).json({message:"varification falid"})
       }
    const razorpay = new Razorpay({
        key_id: 'rzp_test_EHTvWKSbnJinGK',
           key_secret: 'j9oPWAKCEQ6M3wxqhD1HBLXb'
        })
     
        const options = {
            amount: parseInt(amount)*100,
            currency: "INR",
            receipt: "PhoneReceipt"
        };
       
        try {
            const response = await razorpay.orders.create(options)
            console.log(response)

             db.query(`insert into orders_tbl (order_id, user_id, delivered , product_id, pin, address,payment_amount, order_status, quantity,email) values (?,?,?,?,?,?,?,?,?,?)`,[response.id,data.id,0,phone_data,pin,address,amount,"order created",1,email],(err,data)=>{
              if(err){
                throw err
              }
              else{
                console.log(data)
              }
             })
             
  
            res.json({
              response
            })
        } catch (err) {
          console.log(err)
           res.status(400).send('Not able to create order. Please try again!');
        }
})
router.route('/verifypayment').post(async(req, res)=>{
   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "j9oPWAKCEQ6M3wxqhD1HBLXb")
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;
   
  if (isAuthentic) {
   try{
    db.query(`update orders_tbl set   razorpay_order_id = ? ,razorpay_payment_id = ?, order_status = ?`,[razorpay_order_id,razorpay_payment_id,"PAID"],(err,data)=>{
      if(err){
        throw err
      }
      else{
        console.log(data)
      }
    })
   }
   catch(err){
   console.log(err)
   return res.status(300).json({message:err});
   }

 res.redirect(
      `http://localhost:3000/orderhistory?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
}
)

router.route("/getorder").post(async(req,res)=>{
  const {token} = req.body
  let data;
  try{
   
      data = jwt.verify(token,token_sec);

     }
     catch(err){
     return res.status(401).json({message:"varification falid"})
     }
  let queryData;
  try{
    
     db.query("select * from orders_tbl,product_tbl where user_id = ? and orders_tbl.product_id = product_tbl.id order by orders_tbl.orderdate;",[data.id],(err,result,fields)=>{
      if(err){
       throw err;
      }
      else{
      
        res.status(200).json(result)
      }
    })
    
    
  }catch(err){
    console.log(err);
    return res.status(300).json(err);
  }
  
})

export default router