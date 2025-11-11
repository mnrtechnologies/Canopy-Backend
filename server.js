const express = require("express");
const cors = require("cors");
const ConnectDB = require("./config/db");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser")

// ✅ Increase request size limit to handle large consultant arrays
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
ConnectDB();

const PORT = process.env.PORT || 5000;

const promptRoute = require("./routes/promptRoutes")
const authRoute = require("./routes/authRoutes")
const messageRoute = require('./routes/messageRoutes')
const conversationRoute = require('./routes/conversationRoutes')

//Routes
app.use("/api/auth",authRoute);
app.use('/api/prompt',promptRoute)
app.use('/api/message',messageRoute)
app.use('/api/conversation',conversationRoute)


app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
