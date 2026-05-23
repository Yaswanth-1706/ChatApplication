const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

// ================= STORAGE =================

const storage = new CloudinaryStorage({

  cloudinary,

  params: async (req, file) => {

    let folder = "chat-app/files"

    // ================= PROFILE PIC =================

    if (file.fieldname === "profilepic") {

      folder = "chat-app/profilepics"
    }

    // ================= CHAT FILES =================

    if (file.fieldname === "file") {

      folder = "chat-app/messages"
    }

    // ================= RESOURCE TYPE =================

    let resourceType = "auto"

    // IMAGE

    if (
      file.mimetype.startsWith("image")
    ) {

      resourceType = "image"
    }

    // VIDEO

    else if (
      file.mimetype.startsWith("video")
    ) {

      resourceType = "video"
    }

    // AUDIO

    else if (
      file.mimetype.startsWith("audio")
    ) {

      // cloudinary stores audio using video resource type

      resourceType = "video"
    }

    // PDF / OTHER FILES

    else {

      resourceType = "raw"
    }

    return {

      folder,

      resource_type: resourceType
    }
  }
})

// ================= FILE FILTER =================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [

    // ================= IMAGES =================

    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    // ================= PDF =================

    "application/pdf",

    // ================= VIDEOS =================

    "video/mp4",
    "video/mkv",
    "video/webm",
    "video/quicktime",

    // ================= AUDIOS =================

    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm"
  ]

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(null, true)

  } else {

    cb(
      new Error(
        "Unsupported file type"
      ),
      false
    )
  }
}

// ================= MULTER =================

const upload = multer({

  storage,

  fileFilter,

  limits: {

    // 50MB

    fileSize:
      50 * 1024 * 1024
  }
})

module.exports = upload