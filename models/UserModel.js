var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		status: { type: Boolean, required: true, default: 1 },
		callingcode: { type: Number, required: true },
		phone: { type: Number, required: true },
		gender: { type: String, required: true },
		age: { type: Number, required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);