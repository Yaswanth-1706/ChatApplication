const multer = require("multer")

const storage = multer.diskStorage({

   destination:(req,file,cb)=>{

      cb(null,"uploads/")
   },

   filename:(req,file,cb)=>{

      cb(null,Date.now() + "-" + file.originalname)
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

      cb(new Error("Unsupported file type"),false )
   }
}
const upload = multer({
   storage,
   fileFilter
})
module.exports = upload