import mongoose from "mongoose";
import { variables } from "../constants/variables";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", variables.MONGO_URI);
    console.log("Using database name:", variables.MONGO_DATABASE_NAME);
    await mongoose.connect(variables.MONGO_URI, {
      dbName: variables.MONGO_DATABASE_NAME,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
