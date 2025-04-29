import express,{json} from 'express'
import dotenv from 'dotenv'
import { userauth } from './Routes/userauth.js'
import mongoose from 'mongoose'

const app=express() 

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));



dotenv.config()

app.use(json())

app.use('/',userauth)

const PORT = process.env.PORT 

mongoose.connect('mongodb://localhost:27017/productmanagement').then(()=>
    {
        console.log("MongoBD connected successfully to Product Mangement")
    })
    .catch((error)=>
    {
        console.error("Mongodb connection failed",error)
    })

app.listen(PORT,function(){
    console.log("server is listening")
})