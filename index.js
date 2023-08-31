
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();

try {
  mongoose.set("strictQuery", true);
  mongoose.connect("mongodb+srv://duongdaoq:duck130603@cluster0.uwecnnl.mongodb.net/", (err, db) => {
    console.log("err", err);
  });
} catch (error) {
  handleError(error);
}
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);

app.listen(8000, () => {
  console.log("Server is running");
});