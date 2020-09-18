var express = require("express");
const ResultController = require("../controllers/ResultController");

var router = express.Router();

router.get("/survey/:surveyid", ResultController.getSurveyResult);
router.get("/:id", ResultController.getResult);
router.post("/create", ResultController.result);
router.put("/:id", ResultController.updateResult);
router.delete("/:id", ResultController.deleteResult);

module.exports = router;