
import express from "express";

import {
    createBlog,
    getBlog,
    getUserBlogs,
    getAllBlogs,
    updateBlog,
    updateFeaturedImage,
} from "../controllers/blog.controller.js";

import {upload_mul} from "../middlewares/multer.middleware.js";
import {jwt_auth} from "../middlewares/Auth.middleware.js";

const blogRoutes = express.Router();

blogRoutes.use(jwt_auth)

blogRoutes.route("/createBlog").post(createBlog);
blogRoutes.route("/getBlog/:blogId").get(getBlog);
blogRoutes.route("/getUserBlogs").get(getUserBlogs);
blogRoutes.route("/getAllBlogs").get(getAllBlogs);
blogRoutes.route("/updateBlog/:blogId").patch(updateBlog);
blogRoutes.route("/updateFeaturedImage/:blogId").patch(upload_mul.single("featuredImage") , updateFeaturedImage);

export default blogRoutes;