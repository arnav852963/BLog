import {User} from "../models/user.model.js";
import {ApiError} from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js";
import {asyncHandler} from "../utilities/asyncHandler.js";

import {upload} from "../utilities/cloudinary.js";
import {Blog} from "../models/blog.model.js";
import mongoose from "mongoose";


const  createBlog = asyncHandler(async (req, res) => {
    console.log(req?.body)

    const {title, content , slug} = req.body;
    if (!title || !content || !slug || !title.trim() || !content.trim()) throw new ApiError(400, "title and content is required");

    const local  = req?.file?.path
    if(!local) throw new ApiError(400, "featured image is required");

    const {url} = await upload(local);
    if(!url) throw new ApiError(400, "featured image upload failed");

    const blog = await Blog.create({
        title,
        content,
        featuredImage: url,
        owner: req?.user?._id,
        status:"published",
        slug
    })

    if(!blog) throw new ApiError(500, "blog creation failed");

    res.status(201).json(new ApiResponse(201, {} , "blog created successfully"));
})

const  getBlog = asyncHandler(async (req, res) => {

    const {blogId} = req.params;
    if(!blogId.trim()) throw new ApiError(400, "blogId is required")
    const blog = await Blog.findById(blogId)
    if(!blog) throw new ApiError(404, "blog not found");

    res.status(200).json(new ApiResponse(200, blog , "blog retracted successfully"));
})

const getUserBlogs = asyncHandler(async (req, res) => {
    const allUserBlogs = await User.aggregate([{
        $match:{
            _id: new mongoose.Types.ObjectId(req?.user?._id)
        }
    },
        {

            $lookup:{
                from: "blogs",
                foreignField:"owner",
                localField:"_id",
                pipeline:[{
                    $sort:{
                        createdAt: -1
                    },
                    $project:{
                        owner: 0
                    }
                }],
                as:"blogs"
            }
        },{
        $project:{
            blogs:1,
            username:1
        }
        }
    ])

    if(!allUserBlogs || allUserBlogs.length === 0 ) throw new ApiError(500 , " cant fetch blogs")
    if( allUserBlogs[0].blogs.length === 0) return res.status(200).json(new ApiResponse(200 , {} , `no blogs by ${allUserBlogs[0].username}`))

    return  res.status(200).json(new ApiResponse(200 , allUserBlogs[0].blogs , `blogs by ${allUserBlogs[0].username} retracted successfully`))

})

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({status:"published"}).sort({createdAt:-1})
    if(!blogs || blogs.length ===0) throw new ApiError(500, "cant fetch blogs");
    res.status(200).json(new ApiResponse(200, blogs , "blogs retracted successfully"));
})

const updateBlog = asyncHandler(async (req, res) => {

    const {blogId} = req.params;
    const {title, content} = req.body;
    if (!blogId.trim()) throw new ApiError(400, "blogId is required")
    const exist = await Blog.findById(blogId);
    if (!exist) throw new ApiError(404, "blog not found");
    if (exist.owner.toString() !== req?.user?._id.toString()) throw new ApiError(403, "you are not the owner of this blog");

    const obj = {}
    if (title) obj.title = title;
    if (content) obj.content = content;
    const blog = await Blog.findByIdAndUpdate(blogId, {
        $set: obj

    }, {new: true})
    if (!blog) throw new ApiError(404, "blog not updated");

    return res.status(200).json(new ApiResponse(200, {}, "blog updated successfully"))
})

const updateFeaturedImage = asyncHandler(async (req, res) => {

    const {blogId} = req.params;
    if (!blogId.trim()) throw new ApiError(400, "blogId is required")
    const exist = await Blog.findById(blogId);
    if (!exist) throw new ApiError(404, "blog not found");
    if (exist.owner.toString() !== req?.user?._id.toString()) throw new ApiError(403, "you are not the owner of this blog");

    const local  = req?.file?.path
    if(!local) throw new ApiError(400, "featured image is required");

    const {url} = await upload(local);
    if(!url) throw new ApiError(400, "featured image upload failed");

    const blog = await Blog.findByIdAndUpdate(blogId, {
        $set: {
            featuredImage: url
        }

    }, {new: true})
    if (!blog) throw new ApiError(404, "blog not updated");

    return res.status(200).json(new ApiResponse(200, {}, "blog featured image updated successfully"))
})

export {
    createBlog,
    getBlog,
    getUserBlogs,
    getAllBlogs,
    updateBlog,
    updateFeaturedImage
}
