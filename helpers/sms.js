var msg91 = require("msg91")(process.env.MSG91_KEY, "SMSIND", "4" );

const sendSms = (mobileNo, sms) => {
	console.log(mobileNo, sms);
	return new Promise (
		(resolve, reject) => {
			msg91.send(mobileNo, sms, function(err, response){
				console.log(err, response);
				if (err) {
					reject(err);
				} else {
					resolve(response);
				}
			});
            
		}
	);
};
module.exports = { sendSms };