import mongoose from 'mongoose';
import { ENV } from './env.js';
export const connectToDB = async()=>{
    try{
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB connected successfully: ", conn.connection.host); 
    }catch(error){
        console.error("Error connecting to MongoDB", error.message);
        process.exit(1); //1 is fail 0 is success
    }
}