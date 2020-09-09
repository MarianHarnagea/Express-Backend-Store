const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    require: true,
  },
  gc_image_name: {
    type: String,
    required: true,
  },
  product_image: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  comments: [
    {
      title: {
        type: String,
      },
      name: {
        type: String,
      },
      body: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  carousel_images: [{ image: { type: String } }],
  date: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("product", ProductSchema);

module.exports = Product;
