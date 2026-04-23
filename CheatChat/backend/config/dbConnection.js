const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection failed");
    console.error(error);
    throw error;
  }
};

module.exports = dbConnect;
