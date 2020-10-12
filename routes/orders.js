const express = require("express");
const router = express.Router();
const Order = require("../models/order");

const authorized = require("../middleware/authorized");

router.get("/", (req, res) => {
  Order.find()
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

router.get("/:id", (req, res) => {
  let id = req.params.id;
  Order.findById(id)
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

router.post("/", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    city,
    postalCode,
    country,
    totalPrice,
    orderedProducts,
  } = req.body;

  const order = new Order({
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    city,
    postalCode,
    country,
    totalPrice,
    orderedProducts,
  });
  order
    .save()
    .then((result) => console.log(result))
    .catch((err) => console.log(err));

  // console.log(order);
});

router.delete("/delete/:id", authorized, (req, res) => {
  let id = req.params.id;
  Order.findByIdAndDelete(id)
    .then((result) => res.json(result))
    .catch((err) => console.log(err));
});

router.put("/edit", authorized, (req, res) => {
  Order.findByIdAndUpdate(req.body.id, { orderStatus: req.body.status })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

module.exports = router;
