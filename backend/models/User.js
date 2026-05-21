const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
     type:String,
     required:true,
     enum:["male","female"]
    },
    profilepic:{
      type:String,
      required:true,
      default:""
    }
},{timestamps:true})
module.exports=mongoose.model("users",userSchema)