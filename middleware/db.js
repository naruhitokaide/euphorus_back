const knex = require("knex")(require("../knexfile"));

module.exports = (req, res, next) => {
  req.knex = knex;
  next();
};
