import jwt from "jsonwebtoken"
import MessageModel from "../../../../DB/model/Message.model.js"
import UserModel from "../../../../DB/model/User.model.js"
import { asyncHandler } from "../../../utils/errorHandling.js";


export const getUserModule =asyncHandler( async (req, res, next) => {
   
      const users = await UserModel.find({ 
        isDeleted: false ,confirmEmail:true,status:"Online"})
        .select("username -_id").populate({
        path: "messages",
        select: "-_id Message",
      });;
      return res.json({ message: "Done", users });
  
  });

export const getProfile = asyncHandler(async (req, res, next) => {

    //   const { id } = req.params;
      const user = await UserModel.findOne({ _id: req.user._id, isDeleted: false ,confirmEmail:true })
      .select("username messages").populate({
        path: "messages",
        select: "-_id Message",
      });;
      return user
        ? res.json({ message: "user Profile Founded Sucsessfully", user })
        : next(new Error("InValid-UserId"));
       
  });
  export const softDelete =asyncHandler( async (req, res, next) => {
  
      const user = await UserModel.updateOne(
        { _id:req.user._id, isDeleted: false },
        { isDeleted: true }
      );
  
  
      return user.modifiedCount
        ? res.json({
            message: "user deleted Sucsessfully but this user in database" })
        :  next(new Error("InValid-UserId"));
       
  });

  export const restoretodatabase = asyncHandler( async (req, res, next) => {

      
      const user = await UserModel.updateOne(
        { _id:req.user._id, isDeleted: true },
        { isDeleted: false }
      );
  
  
      return user.modifiedCount
        ? res.json({
            message: "user Restored Sucsessfully and your post Restored" })
        :  next(new Error("InValid-UserId"));
       
  });
  
  //it is return object without modifiedCount( hardDeleted== deleted from database)
export const findOneAndDelete = asyncHandler(async (req, res, next) => {
      const user = await UserModel.findOneAndDelete({ _id: req.user._id, isDeleted: false });
      await MessageModel.deleteMany({receiverId:req.user._id});
      return user
        ? res.json({ message: "user Deleted Sucsessfully from database" })
        : next(new Error("InValid-UserId"));
        
  });

  //find user by id and then update if new = true this mean thant user will return with the new result
export const findByIdAndUpdate = asyncHandler(async (req, res, next) => {
  
      const user = await UserModel.findByIdAndUpdate(
        { _id:req.user._id, isDeleted: false },
        req.body,
        { new: true }
      ).select("age username gender").populate({
        path: "messages",
        select: "-_id Message",
      });;
      return user
        ? res.json({ message: "user Updated Sucsessfully", user })
        :  next(new Error("InValid-UserId"));
       
  });