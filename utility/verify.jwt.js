import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
const verifyJwt = async(token)=>{
   try{
     const data = jwt.verify(token,process.env.JWTSEC);
     return data;
   } catch(err){
    return null;
   }
}
export {verifyJwt}
/*
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

*/