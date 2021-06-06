const express = require("express");
const router = express.Router();
const swaggerUI = require("swagger-ui-express");
const yaml = require("yamljs");
const swaggerDocument = yaml.load("./docs/swagger.yaml");

router.use("/", swaggerUI.serve);
router.get("/", swaggerUI.setup(swaggerDocument));

module.exports = router;
