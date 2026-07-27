import mongoose from 'mongoose';
import { ENV } from './env.js';
import dns from 'dns';

// Fix for Windows DNS SRV lookup ECONNREFUSED issue
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.log("DNS setServers warning:", e.message);
}

export const connectToDB = async()=>{
    try{
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB connected successfully: ", conn.connection.host); 
    }catch(error){
        console.error("Error connecting to MongoDB", error.message);
        process.exit(1); //1 is fail 0 is success
    }
}