import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64  } from "../lib/helper.js";
import { nodeCache } from '../app.js';
import { Product } from "../models/product.js";


// token cookies configuration
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};


// connenect database to mongoDB 
const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "e-commerce" })
    .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};


// to send token as server cookie to end-user to authenticate
// to send Token login,Register time
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user}, process.env.JWT_SECRET);

  return res.status(code).cookie("morax-token", token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};



// upload files on cloudinary as array 
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          
          resolve(result);
        }
      );
    });
  });

  try {

    const results = await Promise.all(uploadPromises);
    // Format the results to return public_id and secure_url
    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults; 
  } catch (err) {
    throw new Error("Error uploading files to cloudinary " +  err);
  }
};


// delete files from the cloudinary directory
const deletFilesFromCloudinary = async (publicIds = []) => {
  const promises = publicIds.map((id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};
  

const invalidateCache = async ({
  product,
  order,
  userId,
  orderId,
  productId,
  cartKey
}) => {
  if (product) {
    const productKeys = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));

    productKeys.forEach((key) => nodeCache.del(key));
  }

  if (order) {
    const ordersKeys = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

    ordersKeys.forEach((key) => nodeCache.del(key));
  }

  if(cartKey){
     nodeCache.del(cartKey)
  }
};


const reduceStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    if(order.quantity >  product.stock){
         throw new Error("Order quantity is greater than stocks")      
    }
    product.stock -= order.quantity;
    await product.save();
  }
};


export {
  connectDB,
  sendToken,
  cookieOptions,
  deletFilesFromCloudinary,
  uploadFilesToCloudinary,
  invalidateCache,
  reduceStock,
};
