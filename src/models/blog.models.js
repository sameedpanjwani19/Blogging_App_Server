import mongoose from "mongoose";

const Schema = mongoose.Schema;

const blogsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
    required: true,
  },
  blogImage: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
});

export default mongoose.model("Blog", blogsSchema);
