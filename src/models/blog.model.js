import mongoose, {Schema} from "mongoose";

const blogSchema = new Schema({

    title:{
        type:String,
        required:true,
        trim:true
    },

    slug:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },

    featuredImage:{
        type:String,
    },
    status:{
        type:String,
        enum:["active" , "inactive"],
        default:"draft"
    },


    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }


} , {timestamps:true})

export const Blog = mongoose.model("Blog", blogSchema);