import {asyncHandler} from "../utilities/asyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {upload} from "../utilities/cloudinary.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
    path:"./.env"

})

export const createAccessRefreshToken = async (user) => {

    try {

        const accessToken = jwt.sign(
            {
                _id: user._id,
                email: user.email,


            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
        )

        const refreshToken = jwt.sign(
            {
                _id: user._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
        )

        const refreshedUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                refreshToken: refreshToken
            }

        }, {new: true});

        if (!refreshedUser) throw new ApiError(500, "user was not able to refresh")

        return {accessToken: accessToken, refreshToken: refreshToken}

    } catch (error) {
        throw new ApiError(500, "token creation error --->" , error)
    }



}

const login = asyncHandler(async (req , res)=>{
    const {fullName ,  username , email} = req.body;
    if(!fullName.trim() || !username.trim() || !email.trim()) throw new ApiError(400 , "fullName , username and email is required");
    const exist = await User.findOne({email});
    if(exist) {

        const {accessToken , refreshToken} = await createAccessRefreshToken(exist);

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie('accessToken' , accessToken  , options)
            .cookie('refreshToken' , refreshToken , options)
            .json(new ApiResponse(200, exist, "user logged in successfully"))




    }
    const user = await User.create({
        fullName,
        username,
        email
    })
    if (!user) throw new ApiError(500, "user was not created");

    const {accessToken , refreshToken} = await createAccessRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('accessToken' , accessToken  , options)
        .cookie('refreshToken' , refreshToken , options)
        .json(new ApiResponse(200, user, "user logged in successfully"))
})

const logout = asyncHandler(async (req , res)=>{

    const user = await User.findByIdAndUpdate(req?.user?._id , {
        $set:{
            refreshToken:null
        }
    } , {new:true} );
    if(!user) throw new ApiError(500, "user was not able to logout");
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json(new ApiResponse(200, {} , "user logged out successfully"))
})
export {login ,  logout}