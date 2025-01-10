import { TryCatch } from "../middlewares/error.js";
import { Cart } from "../models/cart.js"
import { nodeCache } from '../app.js'
import { ErrorHandler } from '../utils/utility.js';

import {
  invalidateCache,

} from "../utils/features.js";

import { Product } from "../models/product.js";

// get single that 
export const getCart = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  const key = `cart-${userId}`

  if (!userId) {
    return next(new ErrorHandler("Invalid user Id", 400));
  }

  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "photos name price salePrice stock",
  });

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }



  const validItems = cart.items.filter(
    (productItem) => productItem.productId
  );

  if (validItems.length < cart.items.length) {
    cart.items = validItems;
    cart.save();
  }

  // const populateCartItems = cart.items.map((item) => ({
  //   productId: item.productId ? item.productId._id : null,
  //   photos: item.productId ? item.productId.photos : null,
  //   name: item.productId ? item.productId.name : "Product not found",
  //   price: item.productId ? item.productId.price : null,
  //   salePrice: item.productId ? item.productId.salePrice : null,
  //   stock: item.productId.stock ? item.productId.stock : null,
  //   quantity: item.quantity,
  // }));

  const populateCartItems = cart.items.map((item) => {    
      if(item.quantity > item.productId.stock){
            item.quantity = item.productId.stock;
      }
      return {
        productId: item.productId ? item.productId._id : null,
        photos: item.productId ? item.productId.photos : null,
        name: item.productId ? item.productId.name : "Product not found",
        price: item.productId ? item.productId.price : null,
        salePrice: item.productId ? item.productId.salePrice : null,
        stock: item.productId.stock ? item.productId.stock : 0,
        quantity: item.quantity,
      }
  });



  res.status(201).json({
    success: true,
    message: "Cart items fetch successfully",
    products: populateCartItems
  })

});


export const setQuantity = TryCatch(async (req, res, next) => {

  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity <= 0) {
    return next(new ErrorHandler("Invalid data provide ", 400));
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  const findCurrentProductIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (findCurrentProductIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found !",
    });
  }

  cart.items[findCurrentProductIndex].quantity = quantity;
  await cart.save();

  await cart.populate({
    path: "items.productId",
    select: "photos name price salePrice stock",
  });

  const populateCartItems = cart.items.map((item) => ({
    productId: item.productId ? item.productId._id : null,
    photos: item.productId ? item.productId.photos : null,
    name: item.productId ? item.productId.name : "Product not found",
    price: item.productId ? item.productId.price : null,
    salePrice: item.productId ? item.productId.salePrice : 0,
    stock: item.productId.stock ? item.productId.stock : null,
    quantity: item.quantity,
  }));

  res.status(200).json({
    success: true,
    message: "product successfully updated",
    products: populateCartItems,
  });
})

export const addItem = TryCatch(async (req, res, next) => {
  const { productId, quantity, userId } = req.body;

  if (!productId || !userId || quantity <= 0) {
    return next(new ErrorHandler("Invalid data provided", 400));
  }


  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  let cart = await Cart.findOne({ userId });



  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const findCurrentProductIndex = cart.items.findIndex(
    (item) => item.productId.toString() == productId
  );



  if (findCurrentProductIndex === -1) {
    cart.items.push({ productId, quantity });

  } else {
    cart.items[findCurrentProductIndex].quantity += quantity;

  }

  let products = cart.items;
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    products,
  })

})


export const removeItem = TryCatch(async (req, res, next) => {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    next(new ErrorHandler('Invalid data provide', 400));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    next(new ErrorHandler("Cart not found", 404));
  }

  let populateCartItems = [];
  if (cart.items.length > 0) {

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.populate({
      path: "items.productId",
      select: "photos name price salePrice stock",
    });

    populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      photos: item.productId ? item.productId.photos : null,
      name: item.productId ? item.productId.name : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      stock: item.productId.stock ? item.productId.stock : 0,
      quantity: item.quantity,
    }));
  } else {
    return new (new ErrorHandler("No product foudnd", 400))
  }

  await cart.save();
  res.status(200).json({
    success: true,
    message: "Product removed successfully",
    products: populateCartItems,
  });
})

export const removeCart = TryCatch(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    next(new ErrorHandler("User not found", 400));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) return next(new ErrorHandler("Cart not found", 400));

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: "All cart items removed successfully",
    products: []
  });

})


