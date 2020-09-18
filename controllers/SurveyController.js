const Survey = require("../models/SurveyModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
var decode = require("unescape");
mongoose.set("useFindAndModify", false);

function SurveyData(data) {
	this.id = data._id;
	this.json = data.json.replace(/&#x2F;/g,"/").replace(/&#x27;/g,"'");
	this.user = data.user;
	this.status = data.status;
}

/**
 * Survey Create.
 *
 * @param {JSON} json
 * @param {ObjectId} userid
 *
 * @returns {Object}
 */
exports.survey = [
	auth,
	body("json")
		.isLength({ min: 1 })
		.trim()
		.withMessage("Survey JSON must not be empty.")
		.isJSON()
		.withMessage("Survey JSON must be a valid JSON."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				req.body.json = req.body.json.replace(/&#x2F;/g,"/").replace(/&#x27;/g,"'");
				var survey = new Survey({ json: decode(req.body.json), user: req.user._id });
				survey.save(function(err) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					}
					let surveyData = new SurveyData(survey);
					return apiResponse.successResponseWithData(res, "Survey add Success.", surveyData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Get Survey by id.
 *
 * @param {ObjectId} surveyid
 *
 * @returns {Object}
 */
exports.getSurvey = [
	(req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Survey.findOne({ _id: req.params.id }).then((data)=>{                
				if(data !== null){
					let surveyData = new SurveyData(data);
					return apiResponse.successResponseWithData(res, "Operation success", surveyData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Survey List.
 * 
 * @returns {Object}
 */
exports.getUserSurvey = [
	auth,
	(req, res) => {
		try {
			Survey.find({ user: req.user._id })
				.then((surveys)=>{
					if(surveys.length > 0){
						return apiResponse.successResponseWithData(res, "Operation success", surveys);
					}else{
						return apiResponse.successResponseWithData(res, "Operation success", []);
					}
				});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Survey update.
 * 
 * @param {JSON} json 
 * @param {string} description
 * 
 * @returns {Object}
 */
exports.surveyUpdate = [
	auth,
	body("json")
		.isLength({ min: 1 })
		.trim()
		.withMessage("Survey JSON must not be empty.")
		.isJSON()
		.withMessage("Survey JSON must be a valid JSON."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				req.body.json = req.body.json.replace(/&#x2F;/g,"/").replace(/&#x27;/g,"'");
				var survey = new Survey({ json: decode(req.body.json), _id:req.params.id });
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Survey.findById(req.params.id, function (err, foundSurvey) {
						if(foundSurvey === null){
							return apiResponse.notFoundResponse(res,"Survey not exists with this id");
						}else{
							//Check authorized user
							if(foundSurvey.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								Survey.findByIdAndUpdate(req.params.id, survey, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let surveyData = new SurveyData(survey);
										return apiResponse.successResponseWithData(res,"Survey update Success.", surveyData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Survey Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.surveyDelete = [
	auth,
	(req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Survey.findById(req.params.id, function (err, foundSurvey) {
				if(foundSurvey === null){
					return apiResponse.notFoundResponse(res,"Survey not exists with this id");
				}else{
					//Check authorized user
					if(foundSurvey.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						Survey.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Survey delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];