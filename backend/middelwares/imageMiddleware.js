const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    let folder = "chat-app/files"

    if (file.fieldname === "profilepic") {
      folder = "chat-app/profilepics"
    }

    if (file.fieldname === "file") {
      folder = "chat-app/messages"
    }

    let resource_type = "auto"

    if (file.mimetype.startsWith("image")) {
      resource_type = "image"
    } else if (file.mimetype.startsWith("video")) {
      resource_type = "video"
    } else if (file.mimetype.startsWith("audio")) {
      resource_type = "video" // cloudinary rule: audio uses "video" resource_type
    } else {
      resource_type = "raw" // PDF, docs, etc
    }

    const ext = file.originalname.split(".").pop().toLowerCase()
    const baseName = file.originalname
      .split(".")[0]
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "")

    const public_id =
      resource_type === "raw"
        ? `${Date.now()}-${baseName}.${ext}`
        : `${Date.now()}-${baseName}`

    return {
      folder,
      resource_type,
      public_id,
      // ✅ THIS IS THE KEY FIX — makes raw files publicly accessible
      type: "upload",
      access_mode: "public",
      chunk_size: 6000000
    }
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "application/pdf"
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
})

module.exports = upload