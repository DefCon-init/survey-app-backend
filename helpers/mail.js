const http = require("http");

const options = {
	"method": "POST",
	"hostname": "api.msg91.com",
	"port": null,
	"path": "/api/v5/email",
	"headers": {
		"content-type": "application/json"
	}
};

const sendMail = (to, from, link, templateid) => {
	return new Promise ((resolve, reject) => {
		let data = {
			"authkey" : process.env.MSG91_KEY,
			"template_id" : templateid,
			"to" : to,
			"from" : from,
			"VAR 1" : link
		};
		options.body = data;
		var req = http.request(options, function (res) {
			var chunks = [];

			res.on("data", function (chunk) {
				chunks.push(chunk);
			});
        
			res.on("end", function () {
				var body = Buffer.concat(chunks);
				console.log(body.toString());
				resolve(body.toString());
			});
            
			res.on("error", function (err) {
				console.log("err", err);
				reject(err);
			});
		});
        
		req.end();
	});
};

module.exports = sendMail;