const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "The World Happiness API" });
});

router.get("/rankings/:year?", function (req, res, next) {
  let yearParam = req.query.year;
  let countryParam = req.query.country;

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
    .then((rows) => {
      res.json({ Error: false, Message: "Success", Rankings: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

router.get("/countries", function (req, res, next) {
  const query = req.db
    .from("rankings")
    .select("country")
    .distinct()
    .orderBy("country", "asc");

  query
    .then((rows) => {
      res.json({ Error: false, Message: "Success", Rankings: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

router.get("/factors/:year", function (req, res, next) {
  let limitParam = req.query.limit;
  let countryParam = req.query.country;

  const query = req.db
    .from("rankings")
    .select("*")
    .where("year", "=", req.params.year);

  if (limitParam) {
    query.limit(limitParam);
  }

  if (countryParam) {
    query.where("country", "like", `${countryParam}`)
  }

  query
    .then((rows) => {
      res.json({ Error: false, Message: "Success", Rankings: rows });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error in  MySQL query" });
    });
});

module.exports = router;
