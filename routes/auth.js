const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const auth = require("../middleware/authToken");

// http://localhost:5000/auth/register
// POST
// REGISTER NEW USER

router.post("/register", (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;

  if (!firstname || !lastname || !email || !password)
    return res.status(400).json({ msg: "Enter All Fields" });

  let emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!email.match(emailValidator))
    return res.status(400).json({ msg: "Invalid Email" });

  const newUser = new User({
    firstname,
    lastname,
    email,
    password,
    role,
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      console.log(newUser);

      User.findOne({ email: email }).then((user) => {
        if (!user) {
          newUser
            .save()
            .then((user) => {
              jwt.sign(
                {
                  id: user._id,
                  role: user.role,
                },
                process.env.SECRET_TOKEN,
                { expiresIn: 43200 },
                (err, token) => {
                  if (err) throw err;

                  res.status(200).json({
                    user,
                    token,
                  });
                }
              );
            })
            .catch((err) => console.log(err));
        } else {
          res.json({ msg: "Email already exists" });
        }
      });
    });
  });
});

// http://localhost:5000/auth/login
// POST
// LOGIN USER

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Enter All Fields" });

  User.findOne({ email })
    .then((user) => {
      if (!user) return res.status(400).json({ msg: "Email Not Found" });

      bcrypt
        .compare(password, user.password)
        .then((isValid) => {
          if (!isValid)
            return res.status(400).json({ msg: "Incorect Password" });

          jwt.sign(
            {
              id: user._id,
              role: user.role,
            },
            process.env.SECRET_TOKEN,
            { expiresIn: 43200 },
            (err, token) => {
              if (err) throw err;

              res.status(200).json({
                user,
                token,
              });
            }
          );
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// http://localhost:5000/auth/user
// GET
// GET USER

router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(401).json(err));
});
module.exports = router;
