const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authorize");

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
      return req.db.from("users").insert({
        email: email,
        firstName: null,
        lastName: null,
        dob: null,
        address: null,
        password_hash: password_hash,
      });
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
      const secretKey = auth.SECRET_KEY;
      const expires_in = 60 * 60 * 24; // 1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.json({ token_type: "Bearer", token, expires_in });
      currentUserEmail = email;
    });
});

router.get("/:email/profile", auth.authorize, function (req, res, next) {
  // 1. Retrive path parameter
  const email = req.params.email;

  // 2. Standard output if user requests another users profile
  let query = req.db
    .from("users")
    .select("email", "firstName", "lastName")
    .where("email", "=", email);

  // 3. If user logged in request their own profile,
  // they also get dob and address
  if (auth.CURRENT_USER === req.params.email) {
    query = req.db
      .from("users")
      .select("email", "firstName", "lastName", "dob", "address")
      .where("email", "=", email);
  }

  query
    .then((data) => {
      if (data.length === 0) {
        res.status(404).json({ error: true, message: "User not found" });
        return;
      }
      res.json(data[0]);
    })
    .catch((err) => {
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

router.put("/:email/profile", auth.authorize, function (req, res, next) {
  // 1. Retrieve fields from body
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const address = req.body.address;

  // 2. Verify body
  if (!firstName || !lastName || !dob || !address) {
    res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
    return;
  }

  // 3. Check that user is only updating their own information
  if (auth.CURRENT_USER !== req.params.email) {
    res.status(403).json({
      error: true,
      message: "Forbidden",
    });
    return;
  }

  const updateQuery = req.db
    .from("users")
    .update({
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      address: address,
    })
    .where("email", "=", req.params.email);

  updateQuery.then(() => {
    res
      .status(200)
      .json({ success: true, message: "Profile information updated" });
  });
});

module.exports = router;
