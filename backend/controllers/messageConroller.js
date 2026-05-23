const Chat = require("../models/Chat")
const Message = require("../models/Message")
const { io, getReciverSocketId } = require("../Socket/socket")

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body
    const { id: reciverId } = req.params
    const senderId = req.userId

    if (!senderId) {
      return res.status(401).json({ message: "Not authorized" })
    }

    // FIND OR CREATE CHAT
    let chats = await Chat.findOne({
      members: {
        $all: [senderId, reciverId]
      }
    })

    if (!chats) {
      chats = await Chat.create({
        members: [senderId, reciverId]
      })
    }

    // CLOUDINARY FILE HANDLING
    let fileUrl = ""
    let fileType = ""

    if (req.file) {
      fileUrl = req.file.path   // Cloudinary URL
      fileType = req.file.mimetype
    }

    // VALIDATION
    if (!message && !fileUrl) {
      return res.status(400).json({
        message: "message or file required"
      })
    }

    // CREATE MESSAGE
    const newMessage = new Message({
      chatId: chats._id,
      senderId,
      reciverId,
      message: message || "",
      file: fileUrl,
      fileType: fileType
    })

    // SAVE CHAT + MESSAGE
    chats.messages.push(newMessage._id)

    await Promise.all([
      chats.save(),
      newMessage.save()
    ])

    // SOCKET EMIT
    const reciverSocketId = getReciverSocketId(reciverId)

    if (reciverSocketId) {
      io.to(reciverSocketId).emit("newMessage", newMessage)
    }

    res.status(200).json({
      success: true,
      newMessage
    })

  } catch (err) {
    console.error("Error in sendMessage:", err)
    res.status(500).json({ message: err.message })
  }
}

// ================= GET MESSAGES =================
exports.getMessages = async (req, res) => {
  try {
    const { id: reciverId } = req.params
    const senderId = req.userId

    const chats = await Chat.findOne({
      members: {
        $all: [senderId, reciverId]
      }
    }).populate("messages")

    if (!chats) {
      return res.status(200).send([])
    }

    res.status(200).send(chats.messages)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ================= DELETE CHAT =================
exports.deleteChat = async (req, res) => {
  try {
    const { id: reciverId } = req.params
    const senderId = req.userId

    const chats = await Chat.findOne({
      members: {
        $all: [senderId, reciverId]
      }
    })

    if (!chats) {
      return res.status(404).json({ message: "Chat not found" })
    }

    await Message.deleteMany({
      _id: { $in: chats.messages }
    })

    await Chat.findByIdAndDelete(chats._id)

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ================= SINGLE MESSAGE DELETE =================
exports.singleDeleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const senderId = req.userId

    const message = await Message.findById(messageId)

    if (!message) {
      return res.status(404).json({ message: "Message not found" })
    }

    if (String(message.senderId) !== String(senderId)) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    await Chat.findByIdAndUpdate(message.chatId, {
      $pull: { messages: messageId }
    })

    await Message.findByIdAndDelete(messageId)

    res.status(200).json({
      success: true,
      message: "Single message deleted"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}