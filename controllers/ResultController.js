const Result = require("../models/ResultModel");
const Survey = require("../models/SurveyModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
var decode = require("unescape");
mongoose.set("useFindAndModify", false);

function ResultData(data) {
	this.id = data._id;
	this.data = data.data;
	this.survey = data.survey;
	this.status = data.status;
}

/**
 * Result Create.
 *
 * @param {JSON} data
 * @param {ObjectId} surveyid
 *
 * @returns {Object}
 */
exports.result = [
	auth,
	body("data")
		.isLength({ min: 1 })
		.trim()
		.withMessage("Data JSON must not be empty.")
		.isJSON()
		.withMessage("Data JSON must be a valid JSON."),
	body("surveyid")
		.isLength({ min: 1 })
		.trim()
		.withMessage("Survey id must not be empty."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				req.body.data = req.body.data.replace(/&#x2F;/g,"/").replace(/&#x27;/g,"'");
				var result = new Result({ data: decode(req.body.data), survey: req.body.surveyid });
				result.save(function(err) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					}
					let resultData = new ResultData(result);
					return apiResponse.successResponseWithData(res, "Result add Success.", resultData);
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
 * Get Result by id.
 *
 * @param {ObjectId} id
 *
 * @returns {Object}
 */
exports.getResult = [
	auth,
	(req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Result.findOne({ _id: req.params.id }).populate("survey").then((data)=>{                
				if(data !== null){
					if(data.survey.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					} else {
						let resultData = new ResultData(data);
						return apiResponse.successResponseWithData(res, "Operation success", resultData);	
					}
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
 * Result List.
 * 
 * @param {ObjectId} surveyid
 * 
 * @returns {Object}
 */
exports.getSurveyResult = [
	auth,
	(req, res) => {
		try {
			Survey.findOne({ _id: req.params.surveyid })
				.then((survey)=>{
					if(survey !== null){
						if(survey.user.toString() !== req.user._id){
							return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
						} else {
							Result.find({ survey: req.params.surveyid }).then(results => {
								if(results.length > 0){
									return apiResponse.successResponseWithData(res, "Operation success", results);
								}else{
									return apiResponse.successResponseWithData(res, "Operation success", []);
								}
							});
						}
					}else{
						return apiResponse.ErrorResponse(res, "No data found");
					}
				});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Result update.
 * 
 * @param {JSON} data
 * 
 * @returns {Object}
 */
exports.updateResult = [
	auth,
	body("data")
		.isLength({ min: 1 })
		.trim()
		.withMessage("Data JSON must not be empty.")
		.isJSON()
		.withMessage("Data JSON must be a valid JSON."),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				req.body.data = req.body.data.replace(/&#x2F;/g,"/").replace(/&#x27;/g,"'");
				var result = new Result({ data: decode(req.body.data), _id: req.params.id });
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Result.findById(req.params.id).populate("survey").then(foundResult => {
						if(foundResult === null){
							return apiResponse.notFoundResponse(res,"Result not exists with this id");
						}else{
							//Check authorized user
							if(foundResult.survey.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							} else {
								Result.findByIdAndUpdate(req.params.id, result, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let resultData = new ResultData(result);
										return apiResponse.successResponseWithData(res,"Result update Success.", resultData);
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
 * Result Delete.
 * 
 * @param {string} id
 * 
 * @returns {Object}
 */
exports.deleteResult = [
	auth,
	(req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Result.findById(req.params.id).populate("survey").then(foundResult => {
				if(foundResult === null){
					return apiResponse.notFoundResponse(res,"Result not exists with this id");
				}else{
					//Check authorized user
					if(foundResult.survey.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						Result.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Result delete Success.");
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