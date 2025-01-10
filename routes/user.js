import express from 'express';
import {getMyProfile, login, logout, registerUser, getUser, deleteUser, getAllUsers, makeAdmin } from '../controllers/user.js';
import { singleAvatar } from '../middlewares/multer.js';
import { adminOnly, isAuthenticated } from '../middlewares/auth.js';

const app = express.Router();

//the route for registering new user 
app.post('/register',singleAvatar,registerUser);
app.post('/login',login);





// *** Below routes only access loggedIn user ****
app.use(isAuthenticated);


app.get('/me',getMyProfile);
app.get('/logout',logout);


app.get('/all',adminOnly,getAllUsers)
app.post('/makeadmin/:id',adminOnly,makeAdmin)

// these only access by admin user...
app.use(adminOnly)
app.route('/:id').get(getUser).delete(deleteUser);


export default app;