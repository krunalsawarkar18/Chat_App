const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        default: "",
    },
    attachments: [
        {
            name: { type: String, required: true },
            mime: { type: String, required: true },
            size: { type: Number, required: true },
            kind: { type: String, enum: ["image", "file"], required: true },
            dataUrl: { type: String, required: true },
        }
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
