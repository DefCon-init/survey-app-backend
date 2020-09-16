var express = require("express");
const SurveyController = require("../controllers/SurveyController");

var router = express.Router();

router.get("/", SurveyController.getUserSurvey);
router.get("/:id", SurveyController.getSurvey);
router.post("/create", SurveyController.survey);
router.put("/:id", SurveyController.surveyUpdate);
router.delete("/:id", SurveyController.surveyDelete);

module.exports = router;