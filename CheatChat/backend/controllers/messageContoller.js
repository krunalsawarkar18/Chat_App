const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const { getUserSocketId, io } = require("../socket/socket");

const MAX_ATTACHMENTS = 5;
const MAX_DATAURL_LENGTH = 7_000_000; // ~5MB base64 payload (roughly)

function emitToUsers(userIds, event, payload) {
  const uniqueSocketIds = new Set(
    userIds
      .filter(Boolean)
      .map((userId) => getUserSocketId(userId))
      .filter(Boolean)
  );

  for (const socketId of uniqueSocketIds) {
    io.to(socketId).emit(event, payload);
  }
}

// create message
exports.createNewMessage = async(req,res)=>{
    try {
        // fetch data
        const {receiverId,message,attachments} = req.body;
        const senderId = req.user.userId;

        // validation
        const trimmedMessage = typeof message === "string" ? message.trim() : "";
        const normalizedAttachments = Array.isArray(attachments) ? attachments : [];

        if(!receiverId || !senderId){
            return res.status(400).json({
                success:false,
                message:"Something went wrong during fetchin data"
            })
        }

        if (!trimmedMessage && normalizedAttachments.length < 1) {
          return res.status(400).json({
            success: false,
            message: "Message text or attachment is required",
          });
        }

        if (normalizedAttachments.length > MAX_ATTACHMENTS) {
          return res.status(400).json({
            success: false,
            message: `Too many attachments (max ${MAX_ATTACHMENTS})`,
          });
        }

        for (const attachment of normalizedAttachments) {
          if (
            !attachment ||
            typeof attachment.name !== "string" ||
            typeof attachment.mime !== "string" ||
            typeof attachment.size !== "number" ||
            typeof attachment.kind !== "string" ||
            typeof attachment.dataUrl !== "string"
          ) {
            return res.status(400).json({
              success: false,
              message: "Invalid attachment format",
            });
          }

          if (attachment.dataUrl.length > MAX_DATAURL_LENGTH) {
            return res.status(413).json({
              success: false,
              message: "Attachment too large",
            });
          }
        }
        
        // find conversation
        let conversation = await Conversation.findOne({
            members:{$all:[senderId,receiverId]}
        });

        if(!conversation){ 
             
            // create conversation
            conversation = await Conversation.create({
                members:[senderId,receiverId]
            })
        }

        const newMessage = new Message({
            senderId:senderId,
            receiverId:receiverId,
            message:trimmedMessage,
            attachments: normalizedAttachments,
        });


        if(newMessage){
            conversation.messages.push(newMessage);
        }

        await Promise.all([conversation.save(),newMessage.save()]);

        // implement socket io
        emitToUsers([receiverId], "new-message", newMessage);
        


        // return response
        return res.status(200).json({
            success:true,
            message:"Message send successfully",
            newMessage:newMessage,
        })

        
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success:false,
        message:"Internal Server error"
      })
       
    }
}

// get all messages between both users
exports.getAllMessages  = async(req,res)=>{
    try {

        // fetch data
        const currentUserId = req.user.userId;
        const chatUserId = req.params.chatUserId;

        // validation
        if(!chatUserId || !currentUserId){
            return res.status(400).json({
                success:false,
                message:"Somethimg went wrong during fetching userId's"
            })
        }

        const chatUserDetails = await User.findById(chatUserId);

        if(!chatUserDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }

        const allMessages = await Conversation.findOne({
            members:{$all:[currentUserId,chatUserId]}
        })
          .populate({
            path: "messages",
            select:
              "senderId receiverId message attachments isEdited editedAt isDeleted deletedAt createdAt updatedAt",
            options: { sort: { createdAt: 1 } },
          })
          .exec();

        // return response
        return res.status(200).json({
            success:true,
            message:"Successfully fetched all messages",
            allMessages:allMessages ? allMessages?.messages :  [],
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server error",
        })   
    }
}

// edit a message (only sender)
exports.editMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const messageId = req.params.messageId;
    const { message } = req.body;

    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!messageId || !senderId) {
      return res.status(400).json({
        success: false,
        message: "MessageId or userId missing",
      });
    }

    if (!trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const existing = await Message.findById(messageId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (String(existing.senderId) !== String(senderId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    if (existing.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Deleted messages cannot be edited",
      });
    }

    existing.message = trimmedMessage;
    existing.isEdited = true;
    existing.editedAt = new Date();

    await existing.save();

    emitToUsers([existing.senderId, existing.receiverId], "message-updated", existing);

    return res.status(200).json({
      success: true,
      message: "Message updated",
      updatedMessage: existing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

// delete a message (only sender) - soft delete
exports.deleteMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const messageId = req.params.messageId;

    if (!messageId || !senderId) {
      return res.status(400).json({
        success: false,
        message: "MessageId or userId missing",
      });
    }

    const existing = await Message.findById(messageId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (String(existing.senderId) !== String(senderId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    if (existing.isDeleted) {
      return res.status(200).json({
        success: true,
        message: "Message already deleted",
        deletedMessage: existing,
      });
    }

    existing.isDeleted = true;
    existing.deletedAt = new Date();
    existing.message = "";
    existing.attachments = [];

    await existing.save();

    emitToUsers([existing.senderId, existing.receiverId], "message-deleted", existing);

    return res.status(200).json({
      success: true,
      message: "Message deleted",
      deletedMessage: existing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};
