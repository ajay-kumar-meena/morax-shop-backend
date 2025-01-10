import { compare } from 'bcrypt';
import { User } from '../models/user.js';
import { cookieOptions, deletFilesFromCloudinary, sendToken, uploadFilesToCloudinary } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';
import { TryCatch } from '../middlewares/error.js';



const registerUser = TryCatch(async(req,res,next)=>{
     const {name, email,  gender, dob, password} = req.body;

     const photo = req.file;
     
    
     if(!photo) return next(new ErrorHandler("Avatar  not provided.",400))

     if(!photo.buffer) return next(new ErrorHandler("file buffer  not provided.",400))
     
     if(!name || !email || !gender || !dob || !password) return next(new ErrorHandler("please provide all fields",400))
     

    const profile = await uploadFilesToCloudinary([photo]);
   
    const user = await User.create({
         name,
         email,
         password,
         gender,
         dob,
         photo: {
             public_id: profile[0].public_id,
             url: profile[0].url,
         },
    });
     

     res.status(200).json({
           success: true,
           message: "user creadted successfully",
           user,
     });
    sendToken(res,user,201,"User created successfully");
})

const login = async(req,res,next)=>{
    const { email, password } = req.body;

  

    const user = await User.findOne({ email }).select("+password");
  
    if (!user) return next(new ErrorHandler("Invalid Username or Password", 404));
  
    const isMatch = await compare(password, user.password);
  
    if (!isMatch)
      return next(new ErrorHandler("Invalid Username or Password", 404));
  
    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
}



const getMyProfile = TryCatch(async(req, res, next)=>{
     const user = await User.findById(req.user._id);
     if(!user) return next(new ErrorHandler("User not found", 404));

     res.json({success: true, user});
});



const logout  = TryCatch(async(req, res, next)=>{
   return res.status(200)
          .cookie('morax-token',"",{...cookieOptions,maxAge:0})
          .json({
               success:true,
               message:"Logged out successfully"
           });


})


const getAllUsers = TryCatch(async(req,res,next)=>{

     const users = await User.find({});

     if(!users) return next(new ErrorHandler("Users not found",400));

     res.status(200).json({
         success:true,
         message:"User fetched successfully",
         users
     })
})


const makeAdmin = TryCatch(async(req,res,next)=>{
     const id = req.params.id;

     const user = await User.findById(id);

     if(!user) return next(new ErrorHandler("User not found",400));

     user.role = "admin";

     await user.save();

     res.status(200).json({
         success:true,
         message:"User fetched successfully",
         user
     })
})

const getUser = TryCatch(async(req,res,next)=>{
     const id = req.params.id;

     const user = await User.findById(id);

     if(!user) return next(new ErrorHandler("User not found",400));

     res.status(200).json({
         success:true,
         message:"User fetched successfully",
         user
     })
})


const deleteUser = TryCatch(async(req,res,next)=>{
     const user = await User.findById(req.params.id);

     if(!user) return next(new ErrorHandler("User not found",400));

     await deletFilesFromCloudinary[user.photo]

     await user.deleteOne();

     res.status(200).json({
         success: true,
         message:"User deleted successfully",
     })
})

// export controllers
export { 
     registerUser, 
     login, 
     getMyProfile,
     logout,
     getUser,
     deleteUser,
     getAllUsers,
     makeAdmin,
};