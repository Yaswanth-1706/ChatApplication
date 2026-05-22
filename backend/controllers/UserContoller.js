const user=require("../models/User")
const temporary=require("../models/temporary")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const dotEnv=require("dotenv")
const {sendOtpEmail}=require("../email/SendOtp")
const {generateOtp}=require("../email/GenerateOtp")
dotEnv.config()

exports.createUser=async(req,res)=>{
    try{
        const {name,email,password,gender}=req.body
        const profilepic=req.file?req.file.path:null  // ✅ use .path for Cloudinary full URL
        console.log(req.body)
        const User=await user.findOne({email})
        if(User)
        {
            return res.status(400).json({message:"This email was alredy registerd"})
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const Avatar=profilepic||"/public"+`/${gender}.png`
        const userRecord=await user.create({
            name,
            email,
            password:hashedPassword,
            gender,
            profilepic:Avatar
        })
        return res.status(200).json({message:"user registerd successfully",userRecord})
    }catch(err)
    {
       return res.status(400).json({message:err.message})
    }
}

exports.userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body
        const User=await user.findOne({email})
        if(!User)
        {
            return res.status(400).json({message:"Credentials required"})
        }
        const decodedPassword=await bcrypt.compare(password,User.password)
        if(!decodedPassword)
        {
            return res.status(400).json({message:"credentials required"})
        }
        const token=jwt.sign({userId:User._id,userPass:User.password},process.env.jwt_secret,{expiresIn:"1d"})
        return res.status(200).json({message:"login successful token generated",User,token})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

exports.getUser=async(req,res)=>{
    try{
        // ✅ returns only the logged-in user using token's userId
        const currentUser=await user.findById(req.userId).select("-password")
        return res.status(200).json(currentUser)
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

exports.VerifyOtp=async(req,res)=>{
    try{
        const {email,otp}=req.body
        const temporaryRecord=await temporary.findOne({email})
        if(temporaryRecord)
        {
            if(temporaryRecord.otp===otp)
            {
                const userRecord=await user.create({
                    name:temporaryRecord.name,
                    email:temporaryRecord.email,
                    password:temporaryRecord.password,
                    gender:temporaryRecord.gender,
                    profilepic:temporaryRecord.profilepic,
                    otp:temporaryRecord.otp,
                    otpExpires:temporaryRecord.otpExpires
                })
                await temporary.deleteOne({email})
                return res.status(200).json({message:"email verification done",userRecord})
            }
        }
        else
        {
            res.status(400).json({message:"invalid otp"})
        }
    }catch(err)
    {
        return res.status(500).json({message:err.message})
    }
}

exports.update=async(req,res)=>{
    try{
        const {email}=req.body
        const temporaryRecord=await temporary.findOne({email})
        if(temporaryRecord){
            const otp=generateOtp()
            temporaryRecord.otp=otp
            temporaryRecord.otpExpires=Date.now()+5*60*1000
            await temporaryRecord.save()
            await sendOtpEmail(email,otp)
            console.log("otp sent")
        }
        else
        {
            console.log("update otp error")
        }
    }
    catch(err)
    {
        res.status(400).json({message:err.message})
    }
}

exports.updateProfile=async(req,res)=>{
    try{
        const updateData={}

        // Only update name if provided
        if(req.body.name && req.body.name.trim()){
            updateData.name=req.body.name
        }

        // Only update password if provided
        if(req.body.password && req.body.password.trim()){
            updateData.password=await bcrypt.hash(req.body.password,10)
        }

        // ✅ FIX: req.file.path gives full Cloudinary URL
        // e.g. "https://res.cloudinary.com/yourcloud/image/upload/owprejoftyrr0oeuk93f"
        if(req.file){
            updateData.profilepic=req.file.path
        }

        const updatedUser=await user.findByIdAndUpdate(
            req.userId,
            updateData,
            {new:true}
        ).select("-password")

        res.status(200).json(updatedUser)

    }catch(err){
        res.status(500).json({message:err.message})
    }
}