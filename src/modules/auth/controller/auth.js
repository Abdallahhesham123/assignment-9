import UserModel from "../../../../DB/model/User.model.js";
import verifyModel from "../../../../DB/model/VerificationTokenEmail.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import * as dotenv from "dotenv";
import { generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { generateOtp } from "../../../utils/verification.js";
import transporter from "./../../../../DB/emailConfig.js";
import { isValidObjectId } from "mongoose";
dotenv.config();
export const getAuthModule = (req, res, next) => {
  return res.json({ message: "Auth module" });
};

export const register = asyncHandler(async (req, res, next) => {
  const { username, password, email } = req.body;
  const checkUser = await UserModel.findOne({ email });
  if (checkUser) {
    // return res
    //   .status(404)
    //   .json({ message: "Email Exist Please chose another Email" });

    return next(new Error("Email Exist Please chose another Email"));
  }

  req.body.password = hash({ plaintext: password });
  const newUser = new UserModel(req.body);

  let OTP = generateOtp();
  // console.log(otp);
  const tokenVerify = hash({ plaintext: OTP });

  const newVerification = new verifyModel({
    owner: newUser._id,
    token: tokenVerify,
  });

  await newVerification.save();
  await newUser.save();

  const link = `http://127.0.0.1:3000/verification-email/${newUser._id}`;
  // Send Email
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: newUser.email,
    subject: "abdallah-Site - Verification Email Link",
    html: `     
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
    </head>
    <body>
        <div class="container" style="text-align: center; width:90% ; ;margin: 10px auto;">
            <h1 style="text-align: center; width: 70%;margin: 10px auto;background-color: blueviolet;">
                 We Are Delighted To Welcome You To our Team
                </h1>
    <p style="font-size: medium;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;font-weight: 300;">
        Please Enter Your pin code In form To verify Your email And Enter Site : 
        <span style="color: red; font-size: larger;font-weight: 900;">${OTP}</span>
    </p>
    <p style="font-size: medium;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 300;">
    To verify Your Email Please Enter  this pin code is This link :
    <a style="color: red; font-size: larger;font-weight: 900;" href=${link}>Click Here</a>
    </p>
        </div>
    </body>
    </html>
            
            
             `,
  });
  return res
    .status(200)
    .json({ message: "Successfully Register Please Logged In " });
});

export const login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  const user = await UserModel.findOne({
    email: email,
    isDeleted: false,
  });
  if (!user) {
    // return res.status(404).json({ message: "Invalid Email or password" });
    return next(new Error("Invalid Email or password"));
  }

  const checkPassword = compare({
    plaintext: password,
    hashValue: user.password,
  });

  if (!checkPassword) {
    // return res.status(404).json({ message: "Invalid Email or password" });
    return next(new Error("Invalid Email or password"));
  }

  const token = generateToken({
    payload: {
      id: user._id,
      username: user.username,
      role: user.role,
      Profilepic: user.Profilepic,
      Coverpic: user.Coverpic,
      isLoggedIn: true,
    },
    expiresIn: 60 * 60 * 24 * 30,
  });

  user.status = "Online";
  user.save();

  return res.status(200).json({ message: "Successfully Logged In", token });
});

export const resetpassword = asyncHandler(async (req, res, next) => {
  const { oldpassword, password, confirm_pass } = req.body;

  if (password != confirm_pass) {
    // return res
    //   .status(404)
    //   .json({ message: "Password and comfirm password do not match" });
    return next(new Error("Password and comfirm password do not match"));
  }

  const checkUser = await UserModel.findById(req.user._id);
  console.log(checkUser);

  if (!checkUser) {
    // return res
    //   .status(404)
    //   .json({ message: "This User Isnot Exist in database" });

    return next(new Error("This User Isnot Exist in database"));
  } else {
    const checkPassword = compare({
      plaintext: oldpassword,
      hashValue: checkUser.password,
    });
    if (!checkPassword) {
      // return res
      //   .status(404)
      //   .json({ message: "password isnot exist in database" });
      return next(new Error("password isnot exist in database"));
    }
  }
  const passwordHash = hash({ plaintext: password });
  await UserModel.findOneAndUpdate(
    { _id: req.user._id },
    {
      password: passwordHash,
    }
  );
  return res
    .status(200)
    .json({ message: "Congratulation ,Your Password Changed " });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { otp, UserId } = req.body;

  if (!otp.trim() || !UserId) {
    return next(new Error("Invalid Request Missing Parameters"));
  }
  if (!isValidObjectId(UserId)) {
    return next(new Error("Invalid UserId"));
  }
  const user = await UserModel.findById(UserId);
  if (!user) {
    // return res.status(404).json({ message: "Invalid Email or password" });
    return next(new Error("Sorry, UserNot found"));
  }

  if (user.confirmEmail === true) {
    return next(new Error("This account is already confirmed"));
  }

  const tokenVerifiedModel = await verifyModel.findOne({ owner: user._id });
  if (!tokenVerifiedModel) {
    return next(new Error("This Useer is not found"));
  }

  const checkTokenVerified = compare({
    plaintext: otp,
    hashValue: tokenVerifiedModel.token,
  });

  if (!checkTokenVerified) {
    return next(new Error("This is an error Match Verification"));
  }

  user.confirmEmail = true;

  await verifyModel.findByIdAndDelete(tokenVerifiedModel._id);
  const token = generateToken({
    payload: {
      id: user._id,
      role: user.role,
      Profilepic: user.Profilepic,
      Coverpic: user.Coverpic,
      isLoggedIn: true,
      confirmEmail:true
    },
    expiresIn: 60 * 60 * 24 * 30,
  });

  user.status = "Online";
  user.save();

  return res.status(200).json({ message: "this email is verified", token });
});
