const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    let folder = "chat-app/files"

    // PROFILE PIC
    if (file.fieldname === "profilepic") {
      folder = "chat-app/profilepics"
    }

    // CHAT FILES
    if (file.fieldname === "file") {
      folder = "chat-app/messages"
    }

    return {
      folder,
      resource_type: "image"
    }
  }
})

const fileFilter = (req, file, cb) => {

  const allowedTypes = [

    // IMAGES
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    // PDF
    "application/pdf"
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported file type"), false)
  }
}

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

module.exports = upload