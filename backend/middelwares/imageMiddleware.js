const multer = require("multer")
const path = require("path")

const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

// ================= CLOUDINARY STORAGE =================

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {

    let folder = "chat-app/files"

    // PROFILE PICTURE
    if (file.fieldname === "profilepic") {
      folder = "chat-app/profilepics"
    }

    // CHAT FILES
    if (file.fieldname === "file") {
      folder = "chat-app/messages"
    }

    // ================= RESOURCE TYPE =================

    let resource_type = "auto"

    if (file.mimetype.startsWith("image")) {
      resource_type = "image"
    }

    else if (file.mimetype.startsWith("video")) {
      resource_type = "video"
    }

    else if (file.mimetype.startsWith("audio")) {
      // Cloudinary treats audio under video engine
      resource_type = "video"
    }

    else {
      resource_type = "raw"   // PDFs, docs, etc.
    }

    // ================= FILE NAME FIX =================

    const originalName = path.parse(file.originalname).name
    const extension = path.extname(file.originalname)

    const public_id =
      Date.now() +
      "-" +
      originalName.replace(/\s+/g, "-") +
      extension

    return {
      folder,
      resource_type,

      public_id,

      // IMPORTANT: fixes download behavior
      content_disposition: "inline",

      // helps large uploads (videos)
      chunk_size: 6000000
    }
  }
})

// ================= FILE FILTER =================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    // IMAGES
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    // PDF
    "application/pdf",

    // VIDEOS
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",

    // AUDIOS
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm"
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Unsupported file type"), false)
  }
}

// ================= MULTER EXPORT =================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
})

module.exports = upload