import {Schema} from "mongoose"
import {model} from 'mongoose'

const demo2 = new Schema({

    productname:{type:String,required:true,minlength:3},
    productid:{type:String,required:true,unique:true},
    price:{type:Number,required:true},
    category:{type:String,required:true,lowercase: true},
    description:{type:String,required:true,minlength:10,maxlength:50},
    image:{type:String,required:true},
    useremail:{type:String}
})


const products=model('product',demo2)

export {products}