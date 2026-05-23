const express = require("express")
const controller = require("../controllers/messageConroller")
const jwtMiddleware = require("../middelwares/jwtmiddleware")
const imagemiddleware = require("../middelwares/imageMiddleware")
const axios = require("axios")

const router = express.Router()

// ================= SEND MESSAGE =================
router.post(
  "/send/:id",
  jwtMiddleware.verifyToken,
  imagemiddleware.single("file"),
  controller.sendMessage
)

// ================= GET MESSAGES =================
router.get(
  "/:id",
  jwtMiddleware.verifyToken,
  controller.getMessages
)

// ================= DELETE CHAT =================
router.delete(
  "/delete/:id",
  jwtMiddleware.verifyToken,
  controller.deleteChat
)

// ================= SINGLE MESSAGE DELETE =================
router.delete(
  "/singleDelete/:messageId",
  jwtMiddleware.verifyToken,
  controller.singleDelete
)

// ================= PDF PROXY =================
// Fetches PDF from Cloudinary server-side and streams it to browser
// This bypasses CORS that blocks direct Cloudinary raw URLs
router.get(
  "/pdf-proxy",
  async (req, res) => {
    try {
      const { url } = req.query

      if (!url) {
        return res.status(400).json({ message: "URL is required" })
      }

      // Only allow Cloudinary URLs for security
      if (!url.includes("cloudinary.com")) {
        return res.status(403).json({ message: "Only Cloudinary URLs are allowed" })
      }

      const response = await axios.get(url, {
        responseType: "stream"
      })

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=document.pdf"
      )

      // Stream PDF directly to client
      response.data.pipe(res)

    } catch (err) {
      console.error("PDF proxy error:", err.message)
      res.status(500).json({ message: "Failed to load PDF" })
    }
  }
)

module.exports = router
