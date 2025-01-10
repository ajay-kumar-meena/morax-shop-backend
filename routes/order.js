import express from "express";
import { adminOnly, isAuthenticated } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  getLastOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";


const app = express.Router();

app.use(isAuthenticated)

app.get("/lastorder/:userId", getLastOrder);


// route - /api/v1/order/new
app.post("/new", newOrder);

// route - /api/v1/order/my
app.get("/my", myOrders);

// route - /api/v1/order/my
app.get("/all", adminOnly, allOrders);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly,processOrder)
  .delete(adminOnly,deleteOrder);

export default app;
