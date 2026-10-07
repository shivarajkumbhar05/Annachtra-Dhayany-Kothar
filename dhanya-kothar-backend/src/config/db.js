   const dns = require('dns');
   dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
