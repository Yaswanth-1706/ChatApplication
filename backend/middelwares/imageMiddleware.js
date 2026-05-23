const multer = require("multer")

const {
  CloudinaryStorage
} = require("multer-storage-cloudinary")

const cloudinary =
  require("../config/cloudinary")

// ================= STORAGE =================

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => {

      let folder =
        "chat-app/files"

      // ================= PROFILE PIC =================

      if (
        file.fieldname ===
        "profilepic"
      ) {

        folder =
          "chat-app/profilepics"
      }

      // ================= CHAT FILES =================

      if (
        file.fieldname ===
        "file"
      ) {

        folder =
          "chat-app/messages"
      }

      // ================= RESOURCE TYPE =================

      let resourceType =
        "auto"

      // IMAGES

      if (
        file.mimetype.startsWith(
          "image"
        )
      ) {

        resourceType =
          "image"
      }

      // VIDEOS

      else if (
        file.mimetype.startsWith(
          "video"
        )
      ) {

        resourceType =
          "video"
      }

      // AUDIOS

      else if (
        file.mimetype.startsWith(
          "audio"
        )
      ) {

        // Cloudinary stores audio
        // using video type

        resourceType =
          "video"
      }

      // PDF + OTHER FILES

      else {

        resourceType =
          "raw"
      }

      return {

        folder,

        resource_type:
          resourceType,

        // CLEAN FILE NAME

        public_id:
          Date.now() +
          "-" +
          file.originalname
            .split(".")[0]
            .replace(/\s+/g, "-"),

        // BETTER LARGE VIDEO UPLOADS

        chunk_size:
          6000000
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
    "video/webm",
    "video/quicktime",
    "video/x-matroska",

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

    // 100MB

    fileSize:
      100 * 1024 * 1024
  }
})

module.exports = upload