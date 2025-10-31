const mongoose = require("mongoose");

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Fail to connect db");
        console.error(error);
        process.exit(1);  
    }
};


module.exports = ConnectDB;
