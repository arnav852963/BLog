import {Router} from "express";
import {login, logout} from "../controllers/auth.controller.js";
import {jwt_auth} from "../middlewares/Auth.middleware.js";

const authRoutes = Router();

authRoutes.route("/login").post(login);
authRoutes.route("/logout").patch( jwt_auth,logout);

export default authRoutes