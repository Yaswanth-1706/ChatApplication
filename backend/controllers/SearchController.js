const user=require("../models/User")
exports.searchUser=async(req,res)=>{
    try{
       
        const {search}=req.query
        if(!search.trim()){
            return res.status(400).json({message:"serach not found"})
        }
        const Users=await user.find({
            name:{$regex:search,$options:"i"}
        })
        return res.status(200).json(Users)
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}
