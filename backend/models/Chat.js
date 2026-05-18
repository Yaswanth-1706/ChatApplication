const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({

    members: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],
        required: true
    },

    messages: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "message"
            }
        ],
        default: []
    },

    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        default: null
    }

}, { timestamps: true })

module.exports = mongoose.model("chat", chatSchema)