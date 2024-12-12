import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from a .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `\nMongoDB connected! DB Host: ${mongoose.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection failed: ", error.message);
    process.exit(1); 
  }
};

export default connectDB;
