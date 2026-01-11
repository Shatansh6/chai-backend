import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req,res)=>{
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
      throw new ApiError (401,"Unauthorized request");
    }
    const decodeToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
    const user = User.findById(decodeToken?._id).select("-password -accessToken");
    if(!user){
      throw new ApiError (401,"invalid accessToken");
    }
  } catch (error) {
    throw new ApiError(401, error?.message||"invalid access token")
  }
  next();
})