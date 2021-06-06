const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  const query = req.db
    .from("rankings")
    .select("country")
    .distinct()
    .orderBy("country", "asc");

  query
    .then((rows) => {
      let countryArray = rows.map((element) => element.country);

      res.json(countryArray);
    })
    .catch((err) => {
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

module.exports = router;
