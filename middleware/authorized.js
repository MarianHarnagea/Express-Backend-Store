const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorized = (req, res, next) => {
  const token = req.header("x-auth-token");
  // console.log(req.header("z-auth-token"));

  if (!token) return res.status(401).json({ msg: "No User Loged In" });

  try {
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    if (req.user.role !== "admin")
      return res.status(401).json({ msg: "Not Autorized" });
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid Token" });
  }
};

module.exports = authorized;
