const express = require("express")
const mongoose = require("mongoose")
const dotEnv = require("dotenv")
const cors = require("cors")
const path = require("path")

const UserRouter = require("./Routes/UserRoute")
const messageRouter = require("./Routes/messageRoute")
const { app, server } = require("./Socket/socket")

dotEnv.config()

// ================= DB CONNECT =================
mongoose.connect(process.env.Mongo_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => console.log(err.message))

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "https://chatapplication-frontend-f0uo.onrender.com",
  credentials: true
}))

// IMPORTANT: body limits must come BEFORE routes
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true, limit: "100mb" }))

// ================= STATIC FILES =================
app.use("/public", express.static("public"))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ================= ROUTES =================
app.use("/user", UserRouter)
app.use("/message", messageRouter)

// ================= SERVER =================
const port = process.env.PORT || 8000

server.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})