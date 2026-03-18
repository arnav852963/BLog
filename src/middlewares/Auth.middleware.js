import { ApiError } from "../utilities/ApiError.js";
import jwt from "jsonwebtoken";

export const jwt_auth = (req, _, next) => {
    try {
        const token =
            req?.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Token not found, please login"));
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        if (!decodedToken) {
            return next(new ApiError(401, "Unauthorized token"));
        }

        req.user = decodedToken;
        return next();

    } catch (e) {
        console.log("error in jwt_auth", e.message);
        return next(
            new ApiError(401, `error in jwt_auth ${e.message}`)
        );
    }
};