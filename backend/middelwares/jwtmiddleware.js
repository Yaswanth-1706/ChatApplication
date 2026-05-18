const jwt=require("jsonwebtoken")
const dotEnv=require("dotenv")
dotEnv.config()
exports.verifyToken=async(req,res,next)=>{
    const token=req.headers.authorization?.split(" ")[1]
    if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
}
    try{
    const decode=jwt.verify(token,process.env.jwt_secret)
    req.userId=decode.userId
    req.userPass=decode.userPass
    next()
    }
    catch(err)
    {
        return res.status(400).json({message:err.message})
    }
}