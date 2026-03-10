import mongoose, {Schema} from "mongoose";

const blogSchema = new Schema({

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }


} , {timestamps:true})