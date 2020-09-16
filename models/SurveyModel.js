var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SurveySchema = new Schema(
	{
		json: { type: Object, required: true },
		user: { type: Schema.ObjectId, ref: "User", required: true },
		status: { type: Boolean, required: true, default: 1 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Survey", SurveySchema);
