import MessageModel from "../../../../DB/model/Message.model.js";
import UserModel from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

export const getALLMessages = async (req, res, next) => {
const messages = await MessageModel.find({ receiverId:req.user._id });
  return res.json({ message: "Messagemodule", messages });
};

export const getMessageprivate = async (req, res, next) => {

    const {id}= req.params
  
  const messages = await UserModel.findById(id).populate({
    path: "messages",
    select: "-_id Message",
  });
  return res.json({ message: "Messagemodule", messages });
};

export const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  const { Message } = req.body;

  const user = await UserModel.findById(receiverId);

  if (!user) {
    return next(new Error("InValid - Account"));
  }

  const messageCreated = await MessageModel.create({
    receiverId: user._id,
    Message,
  });
  await UserModel.updateOne(
    { _id: user._id },
    { $push: { messages: messageCreated._id } }
  );
  return res
    .status(201)
    .json({ message: "messageCreated Successfully", messageCreated });
});
