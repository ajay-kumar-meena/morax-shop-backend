import { TryCatch } from "../middlewares/error.js";
import { nodeCache } from '../app.js'
import { ErrorHandler } from '../utils/utility.js';
import  { Features }  from '../models/features.js'

import {
  deletFilesFromCloudinary,
  invalidateCache,
  uploadFilesToCloudinary,
} from "../utils/features.js";




export const getImages = TryCatch(async (req, res, next) => {   
    const images = await Features.find({});
     
    res.status(200).json({
         success:true,
         message: "Image fetched successfully",
         images
    })

});
  
export const addIamge = TryCatch(async (req, res, next) => {

  const photo = req.file;

  if (!photo) return next(new ErrorHandler("Please add Photo", 400));


  const photoURL = await uploadFilesToCloudinary([photo]);

  await Features.create({
     image:{
        public_id: photoURL[0].public_id,
        url: photoURL[0].url,
     }
  })
 
  return res.status(201).json({
    success: true,
    message: "Add Feature Image Successfully",
  });
});

export const removeImage = TryCatch(async (req, res, next) => {
  
  const { id } = req.params;
  
  const featureImage = await Features.findById(id);

  if(!featureImage) return next(new ErrorHandler("Image Not Found", 404));
  
  if (!featureImage.image.public_id) {
    return next(new ErrorHandler("Image or image details not found", 404));
  }
  
  const featureImagePublicId = featureImage.image.public_id;

  await deletFilesFromCloudinary([featureImagePublicId]);

  await Features.deleteOne();


  return res.status(200).json({
    success: true,
    message: "Features image Delete Successfully",
  });
});

