const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  let yearParam = req.query.year;
  let countryParam = req.query.country;

  // Check if year parameter is in fomat YYYY
  if (yearParam && yearParam.length !== 4) {
    res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be YYYY.",
    });
    return;
  }

  // Check if country parameter contains numbers
  if (countryParam && /\d/.test(countryParam)) {
    res.status(400).json({
      error: true,
      message: "Invalid country format. Country query cannot contain numbers.",
    });
    return;
  }

  // Check for invalid query parameters
  for (let param in req.query) {
    if (param !== "country" && param !== "year") {
      res.status(400).json({
        error: true,
        message:
          "Invalid query parameters. Only year and country are permitted.",
      });
      return;
    }
  }

  const query = req.db
    .from("rankings")
    .select("rank", "country", "score", "year")
    .orderBy("year", "desc");

  if (yearParam) {
    query.where("year", "like", `${yearParam}`);
  }

  if (countryParam) {
    query.where("country", "like", `${countryParam}`);
  }

  query
    .then((rankings) => {
      res.json(rankings);
    })
    .catch((err) => {
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

module.exports = router;
