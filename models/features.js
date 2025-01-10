import mongoose from "mongoose";


const FeatureSchema = new mongoose.Schema({
  image:{
    public_id: {
        type: String,
        required: [true, "Please enter Public ID"],
      },
      url: {
        type: String,
        required: [true, "Please enter URL"],
      },      
  },
},

{timestamps: true });

export const Features  = mongoose.model("Features",FeatureSchema);
