import {Schema} from "mongoose"
import {model} from 'mongoose'

const demo1 = new Schema({

    name:{type:String,required:true,minlength:3},
    roles:{type:String,required:true,enum: ["user", "admin"]},
    userid:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true,match: [/^\S+@\S+\.\S+$/, 'Invalid email format']},
    password:{type:String,required:true}
})


const users=model('users',demo1)

export {users}