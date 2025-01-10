import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { User } from "../models/user.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import {ErrorHandler} from "../utils/utility.js";


export const getLastOrder = TryCatch(async (req, res, next) => {
  const { userId } = req.params; 


  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  const user = User.findById(userId);

  if(!user)    return next(new ErrorHandler("User not found", 404));

  // Fetch the latest order for the user
  const order = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
  
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    order, 
  });
});



export const myOrders = TryCatch(async (req, res, next) => {
  const { id : user } = req.query;
 

  const key = `my-orders-${user}`;

  let orders = nodeCache.get(key);

  // if (!orders) {
    orders = await Order.find({ user });
    // nodeCache.set(key, orders); 

    
  // }
  
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name");
  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order = nodeCache.get(key);

  if (!order) {
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Order Not Found", 404));

    nodeCache.set(key, order); 
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = TryCatch(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    user,
    subtotal,
    tax,
    shippingCharges,
    total,
  } = req.body;

 

  if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
    return next(new ErrorHandler("Please Enter All Fields", 400));

  const order = await Order.create({
    shippingInfo,
    orderItems,
    user,
    subtotal,
    tax,
    shippingCharges,
    total,
  });
  

  await reduceStock(orderItems);

  await invalidateCache({
    product: true,
    order: true,
    userId: user,
    productId: order.orderItems.map((i) => String(i.productId)),
  });

  return res.status(201).json({
    success: true,
    message: "Order Placed Successfully",
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;


  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
