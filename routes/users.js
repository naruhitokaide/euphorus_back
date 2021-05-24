const express = require("express");
const router = express.Router();

router.post("/register", (req, res, next) => {
  const email = req.body.Email;
  const password = req.body.Password;

  if (!email || !password) {
    res.status(400).json({
      message: `Request body incomplete, both email and password are required`,
    });
    console.log(`Error on request body:`, JSON.stringify(req.body));
  } else {
    console.log(email);
    const query = req.db.select("*").from("users").where("email", "=", email);

    query.then((result) => {
      if (result.length > 0) {
        res.status(409).json({
          message: `User already exists`,
        });
      }
      const insert = req
        .db("happiness")
        .insert({ email, password })
        .into("users");

      insert
        .then(() => {
          res.status(201).json({ success: true, message: "User created" });
        })
        .catch((err) => next(err));
    });
  }
});

module.exports = router;
