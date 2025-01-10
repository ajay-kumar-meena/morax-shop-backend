import express from 'express';
import { adminOnly} from '../middlewares/auth.js';
import { singleAvatar } from '../middlewares/multer.js';
import { addIamge, getImages, removeImage } from '../controllers/features.js';

const app = express.Router();

app.get('/get', getImages);

app.use(adminOnly);

app.post('/add',singleAvatar, addIamge);

app.delete('/:id',removeImage);



export default app;