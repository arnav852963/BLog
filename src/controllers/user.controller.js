import {User} from "../models/user.model.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {asyncHandler} from "../utilities/asyncHandler.js";

import {createAccessRefreshToken} from "./auth.controller.js";
import {upload} from "../utilities/cloudinary.js";



import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
})



const getUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req?.user?._id).select("-refreshToken")
    if(!user) throw new ApiError(401, "user not found");

    res.status(200).json(new ApiResponse(200, user , "user retracted"));


})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const token = req?.cookies?.refreshToken;

    if(!token) throw new ApiError(401, "refresh token not found");

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if(!decoded) throw new ApiError(401, "refresh token not found");
    const user = await User.findById(decoded._id)


    if(!user) throw new ApiError(401, "user not found");

    const {accessToken, refreshToken} = await createAccessRefreshToken(user);

    if(!accessToken) throw new ApiError(401, "accessToken not found");

    return res.status(200)
        .cookie('accessToken' , accessToken  , {http:true , secure:true})
        .json(new ApiResponse(200 , {accessToken: accessToken} , "token refreshed" ));











})



const updateAvatar = asyncHandler(async (req, res) => {
    if(!req.file) throw new ApiError(401, "file not found");

    const local_avatar = req?.file?.path
    if(!local_avatar) throw new ApiError(401, "local avatar path not found");

    const upload_avatar = await upload(local_avatar);
    if(!upload_avatar.url) throw new ApiError(401, "avatar not uploaded to  cloud");

    const user = await User.findByIdAndUpdate(req?.user?._id  , {
        $set:{
            avatar: upload_avatar?.url
        }
    } , {new:true}).select("-refreshToken")

    if(!user) throw new ApiError(401, "user avatar not  updated");



    return res.status(200).json(new ApiResponse(200, {} , "user avatar updated"));



})

export {getUser, refreshAccessToken ,  updateAvatar}



