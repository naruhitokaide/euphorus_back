const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorize = require("../middleware/authorize");

router.post("/register", function (req, res, next) {
  // 1. Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;

  // 2. Check if both email and password are entered
  if (!email || !password) {
    res.status(400).json({
      message: `Request body incomplete, both email and password are required`,
    });
    return;
  }

  // 3. Determine if user already exists in table
  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then((users) => {
      if (users.length > 0) {
        res.status(409).json({ error: true, message: "User already exists" });
        console.log("User already exists");
        return;
      }

      // 4. If user does not exist, insert into table
      const saltRounds = 10;
      const password_hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({ email, password_hash });
    })
    .then(() => {
      res.status(201).json({ success: true, message: "User created" });
    });
});

router.post("/login", function (req, res, next) {
  // 1. Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;

  // 2. Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  // 3. Determine if user already exists in table
  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then((users) => {
      if (users.length === 0) {
        res.status(401).json({ error: true, message: "User does not exist" });
        return;
      }
      const user = users[0];
      return bcrypt.compare(password, user.password_hash);
    })
    .then((match) => {
      if (!match) {
        res
          .status(401)
          .json({ error: true, message: "Incorrect email or password" });
        return;
      }
      const secretKey = authorize.SECRET_KEY;
      const expires_in = 60 * 60 * 24; // 1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.json({ token_type: "Bearer", token, expires_in });
    });
});

router.get("/:email/profile", function (req, res, next) {});

router.put("/:email/profile", function (req, res, next) {});

module.exports = router;
