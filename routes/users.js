const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authorize");
const moment = require("moment");

router.post("/register", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Check if both email and password are entered
  if (!email || !password) {
    res.status(400).json({
      message: `Request body incomplete, both email and password are required`,
    });
    return;
  }

  // Determine if user already exists in table
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

      // If user does not exist, insert into table
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
  const email = req.body.email;
  const password = req.body.password;

  // Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  // Determine if user already exists in table
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
      const secretKey = process.env.SECRET_KEY;
      const expires_in = 60 * 60 * 24; // 1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.json({ token_type: "Bearer", token, expires_in });
      currentUserEmail = email;
    });
});

router.get("/:email/profile", function (req, res, next) {
  const email = req.params.email;

  // Standard output if user requests another users profile
  let query = req.db
    .from("users")
    .select("email", "firstName", "lastName")
    .where("email", "=", email);

  // If user logged in requests their own profile,
  // they also get dob and address
  if (req.headers.authorization !== undefined) {
    const authorization = req.headers.authorization;
    let token = null;
    if (authorization.split(" ").length === 2) {
      token = authorization.split(" ")[1];
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.email === req.params.email) {
      query = req.db
        .from("users")
        .select("email", "firstName", "lastName", "dob", "address")
        .where("email", "=", email);
    }
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
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const address = req.body.address;

  // Verify body
  if (!firstName || !lastName || !dob || !address) {
    res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
    return;
  }

  // Check parameters are correct type
  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof address !== "string"
  ) {
    res.status(400).json({
      error: true,
      message:
        "Request body invalid, firstName, lastName and address must be strings only.",
    });
    return;
  }

  let currentDate = moment();
  let birthDate = moment(dob);

  // Check format of dob
  if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
    console.log(dob);
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
    });
    return;
  }

  // Check if dob is out of bounds
  if (birthDate.isAfter(currentDate)) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past.",
    });
    return;
  }

  const authorization = req.headers.authorization;
  let token = null;
  if (authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  }
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // Check that user is only updating their own information
  if (decoded.email !== req.params.email) {
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

  let newProfile = {
    email: req.params.email,
    firstName: firstName,
    lastName: lastName,
    dob: dob,
    address: address,
  };

  updateQuery
    .then(() => {
      res.status(200).json(newProfile);
    })
    .catch((err) =>
      res.json({ Error: true, Message: "Error in  MySQL query" })
    );
});

module.exports = router;
