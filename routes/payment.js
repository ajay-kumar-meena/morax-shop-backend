import express from "express";
import {
  checkout,
  getKey,
  paymentVerification,
} from "../controllers/payment.js";

const app = express.Router();

app.get("/getkey", getKey)
app.post('/checkout', checkout);
app.post('/paymentverification', paymentVerification);

export default app;
