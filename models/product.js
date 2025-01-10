import mongoose ,{ Schema,model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "Please enter Public ID"],
        },
        url: {
          type: String,
          required: [true, "Please enter URL"],
        },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please enter orginal Price"],
    },
    salePrice: {
      type: Number,
      required: [true, "Please enter sale Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter Category"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Please enter Brand"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter Description"],
    },
  },
  {
    timestamps: true,
  }
);


export const Product  = model("Product",schema);




// important
// add rating and review functionality.... 
// ratings: {
//   type: Number,
//   default: 0,
// },

// numOfReviews: {
//   type: Number,
//   default: 0,
// },