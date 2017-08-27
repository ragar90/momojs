const exec = require('child_process').exec;


module.exports = function (command) {
	return new Promise(function (resolve, reject) {
		exec(command, (error, stdout, stderr) => {
		    console.log(`${stdout}`);
		    console.log(`${stderr}`);
		    if (error !== null) {
		        reject(error)
		    } else {
		    	resolve()
		    }
		});
	})
}