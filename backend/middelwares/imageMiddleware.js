const multer = require("multer")

const {
  CloudinaryStorage
} = require("multer-storage-cloudinary")

const cloudinary =
  require("../config/cloudinary")

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (
      req,
      file
    ) => {

      let folder =
        "chat-app/files"

      if (
        file.fieldname ===
        "profilepic"
      ) {

        folder =
          "chat-app/profilepics"
      }

      if (
        file.fieldname ===
        "file"
      ) {

        folder =
          "chat-app/messages"
      }

      let resourceType =
        "auto"

      if (
        file.mimetype.startsWith(
          "image"
        )
      ) {

        resourceType =
          "image"
      }

      else if (
        file.mimetype.startsWith(
          "video"
        )
      ) {

        resourceType =
          "video"
      }

      else if (
        file.mimetype.startsWith(
          "audio"
        )
      ) {

        resourceType =
          "video"
      }

      else {

        resourceType =
          "raw"
      }

      return {

        folder,

        resource_type:
          resourceType,

        public_id:
          Date.now() +
          "-" +
          file.originalname
            .split(".")[0]
            .replace(/\s+/g, "-"),

        chunk_size:
          6000000
      }
    }
  })

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [

    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    "application/pdf",

    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",

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

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      100 * 1024 * 1024
  }
})

module.exports = upload