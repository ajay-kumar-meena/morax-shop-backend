import express from 'express';
import { adminOnly, isAuthenticated } from '../middlewares/auth.js';
import { addItem, getCart, removeCart, removeItem, setQuantity } from '../controllers/cart.js';

const app = express.Router();

//the route for registering new user 

app.use(isAuthenticated)

app.get('/get/:userId',getCart);
app.post('/add',addItem);
app.put('/update-cart',setQuantity);
app.delete('/:userId/:productId',removeItem);
app.delete('/destroy/:userId',removeCart);



// below route only for admin user

app.use(adminOnly);


export default app;