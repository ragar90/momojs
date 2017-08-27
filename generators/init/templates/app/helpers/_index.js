var fs = require('fs-extra');
var _ = require('lodash')

function returnFiles() {
	var files = fs.readdirSync('.')
	var correctFiles = _.filter(files, file => {
		return file !== 'index.js' && file.match(/([a-z]|_|\d)+_helper\.js/g);
	})
	return correctFiles
}

function generateModuleExportObj(){
	var modelFiles = returnFiles()
	var moduleObj = {}
	_.each(modelFiles, file => {
		var modelName = file.split('.js')[0]
		var objKey = _.snakeCase(modelName)
		moduleObj[objKey] = require(file)
	})
	return moduleObj
}

module.exports = generateModuleExportObj()