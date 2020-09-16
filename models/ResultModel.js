var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ResultSchema = new Schema(
	{
		data: { type: Object, required: true },
		survey: { type: Schema.ObjectId, ref: "Survey", required: true },
		status: { type: Boolean, required: true, default: 1 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);
