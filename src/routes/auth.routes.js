import {Router} from "express";
import {login, logout, signin} from "../controllers/auth.controller.js";
import {jwt_auth} from "../middlewares/Auth.middleware.js";

const authRoutes = Router();
authRoutes.route("/signin").post(signin)
authRoutes.route("/login").post(login);
authRoutes.route("/logout").patch( jwt_auth,logout);

export default authRoutes