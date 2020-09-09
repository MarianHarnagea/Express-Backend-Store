const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./uploads"));

// DB CONNECTION
mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected");
    app.listen(process.env.PORT || 5000);
  });

// ROUTES

app.use("/", require("./routes/index"));
app.use("/products", require("./routes/products"));
