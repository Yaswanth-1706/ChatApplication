const express=require("express")
const mongoose=require("mongoose")
const dotEnv=require("dotenv")
const cors=require("cors")
const UserRouter=require("./Routes/UserRoute")
const messageRouter=require("./Routes/messageRoute")
const {app,io,server}=require("./Socket/socket")
const path=require("path")
dotEnv.config()
mongoose.connect(process.env.Mongo_URI).then(()=>{
    console.log("db connected successfully")
}).catch((err)=>{
    console.log(err.message)
})
//const app=express()
app.use(express.json())
app.use(cors({
   origin:"https://chatapplication-frontend-f0uo.onrender.com",
   credentials:true
}))
app.use("/public", express.static("public"))
app.use("/user",UserRouter)
app.use("/message",messageRouter)
app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true, limit: "100mb" }))
const port=process.env.PORT||8000
server.listen(port,()=>{
    console.log(`sever is running on port:${port}`)
})
