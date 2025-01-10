import multer from "multer";

export const singleAvatar = multer().single("photo");
export const multiUpload = multer().array("photos", 5);
