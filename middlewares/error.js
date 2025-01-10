const errorMiddleware = (err,req, res, next)=>{    
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    return res.status(err.statusCode).json({
         success: false,
         message: err.message,
     });
}

const TryCatch = (passfun)=> async(req,res,next)=>{
     try{
        await passfun(req,res,next);
     }
     catch(err){
        next(err);
     }
}

export {TryCatch,errorMiddleware};