const express = require("express");
const router = express.Router();
const auth = require("../middleware/authorize");

router.get("/:year", auth.authorize, function (req, res, next) {
  let limitParam = req.query.limit;
  let countryParam = req.query.country;

  // Throw error if year format is incorrect
  if (req.params.year.length !== 4) {
    res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy.",
    });
  }

  // Throw error if country format is incorrect
  if (/\d/.test(countryParam)) {
    res.status(400).json({
      error: true,
      message:
        "Invalid country format. Country query parameter cannot contain numbers.",
    });
  }

  // Throw error if limit is negative
  if (limitParam < 0) {
    res.status(400).json({
      error: true,
      message: "Invalid limit query. Limit must be a positive number.",
    });
  }

  // Throw error if limit is decimal
  if (limitParam !== undefined && limitParam % 1 != 0) {
    res.status(400).json({
      error: true,
      message: "Invalid limit query. Limit cannot be decimal.",
    });
  }

  const query = req.db
    .from("rankings")
    .select(
      "rank",
      "country",
      "score",
      "economy",
      "family",
      "health",
      "freedom",
      "generosity",
      "trust"
    )
    .where("year", "=", req.params.year);

  if (limitParam) {
    query.limit(limitParam);
  }

  if (countryParam) {
    query.where("country", "like", `${countryParam}`);
  }

  query
    .then((factors) => {
      res.json(factors);
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

module.exports = router;
