const nodemailer=require("nodemailer")
const dotEnv=require("dotenv")
dotEnv.config()
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.Email_User,
        pass:process.env.Email_Pass
    }
})
exports.sendOtpEmail=async(email,otp)=>{
    await transporter.sendMail({
        from:process.env.Email_User,
        to:email,
        subject:"Your OTP for Email Verification",
        html:`<h2>Your OTP is : ${otp}</h2> <p>otp valid up to 5 min</p>`
    })
}