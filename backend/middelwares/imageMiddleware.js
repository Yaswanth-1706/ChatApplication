const multer = require("multer")
const fs = require("fs")

if (!fs.existsSync("uploads")) {
   fs.mkdirSync("uploads")
}

const storage = multer.diskStorage({

   destination:(req,file,cb)=>{
      cb(null,"uploads/")
   },

   filename:(req,file,cb)=>{

      const uniqueName =
         Date.now() + "-" + file.originalname.replace(/\s+/g,"-")

      cb(null,uniqueName)
   }
})

const fileFilter = (req,file,cb)=>{

   const allowedTypes = [

      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",

      "video/mp4",
      "video/webm",
      "video/ogg",

      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",

      "application/pdf"
   ]

   if(allowedTypes.includes(file.mimetype)){

      cb(null,true)

   }else{

      cb(new Error("Unsupported file type"),false)
   }
}

const upload = multer({

   storage,

   fileFilter,

   limits:{
      fileSize:50 * 1024 * 1024
   }
})

module.exports = upload