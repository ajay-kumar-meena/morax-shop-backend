import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import dotenv from 'dotenv'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { v2 as cloudinary} from 'cloudinary'
import NodeCache from 'node-cache'
import Razorpay from "razorpay";


export const nodeCache = new NodeCache();

dotenv.config()




export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});




const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});






// using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));




// Apply CORS globally
app.use(cors({
  origin: [process.env.CLIENT_URL,'http://localhost:5173'], // Allow requests from this frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow these headers
  credentials: true, // Enable cookies/auth headers
}));


const mongoURI = process.env.MONGO_URI || `mongodb://localhost:27017`;
const  port  = process.env.PORT || 3000;
connectDB(mongoURI);





// import routes
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/order.js';
import cartRoute from './routes/cart.js';
import featureimagesRoute from './routes/feature.js'
import paymentRoute from './routes/payment.js'




// set routes respontives with api 
app.use("/api/v1/user",userRoute);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/cart",cartRoute);
app.use("/api/v1/order",orderRoute);
app.use("/api/v1/featureimages",featureimagesRoute);
app.use('/api/v1/payment',paymentRoute)




app.use(errorMiddleware);

app.listen((port),()=>{
    console.log(`Server started on port ${port}`);
})


 