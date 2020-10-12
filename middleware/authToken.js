const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).json({ msg: "Not Autorized" });

  try {
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Not Autorized" });
  }
};

module.exports = auth;
