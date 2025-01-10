import jwt  from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { User } from "../models/user.js";





const isAuthenticated = (req,res,next)=>{

    const token = req.cookies["morax-token"];

    if(!token) return next(new ErrorHandler("Please first Login to system", 401));

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decodedData._id;
    next();
}




// Middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async (req, res, next) => {

  const id = req.user._id;
  if (!id) return next(new ErrorHandler("Please Login to the system", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("user not found", 401));
  if (user.role !== "admin")
    return next(new ErrorHandler("Operation only perform by admin", 403));

  next();
});


export {isAuthenticated};