import mongoose from "mongoose";
import {Schema} from "mongoose";
import bcrypt from "bcrypt"

const userschema = new Schema({

    fullName:{
        type:String,

        trim:true
    },

    username:{
        type:String,


        lowercase:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },


    refreshToken:{
        type:String,
        default:null
    },

    avatar:{
        type:String,
    },
    password:{
        type:String,
        required:true
    }





} , {timestamps: true});

userschema.pre("save" , async function (next/*next flag ..pass to the next middleware*/) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password , 10);
    next();
    /*
    upto this...anytime we change data in any  user field...this middleware will run
    and encrpt the passwrod every time ..so we have to make sure that it does so
    only when password gets trigger
     */

});
userschema.methods.isPasswordCorrect = async function(password) {

    return await bcrypt.compare(password , this.password) // boolean t or f
}

export const User = mongoose.model("User", userschema);

