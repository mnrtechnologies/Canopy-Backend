const express = require("express");
const cors = require("cors");
const ConnectDB = require("./config/db");
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
ConnectDB();

const PORT = process.env.PORT || 5000;

const authRouter = require("./routes/authRoutes")

//Routes
app.use("/api/auth",authRouter);

app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
