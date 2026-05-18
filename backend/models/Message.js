const mongoose = require("mongoose")

const messageSchema =new mongoose.Schema({

    chatId: {

        type:mongoose.Schema.Types.ObjectId,

        ref: "chat"
    },

    senderId: {

        type:mongoose.Schema.Types.ObjectId,

        ref: "user",

        required: true
    },

    reciverId: {

        type:mongoose.Schema.Types.ObjectId,

        ref: "user",

        required: true
    },

    message: {

        type: String,

        default: ""
    },

    file: {

        type: String,

        default: ""
    },

    fileType: {

        type: String,

        default: ""
    }

}, {
    timestamps: true
})

module.exports =mongoose.model("message",messageSchema)