var fs = require('fs-extra');
var _ = require('lodash')
var mustache = require('mustache');
var path = require('path');
const shellCommand = require('../../helpers/shell_command');

var structure = {
	app: ['models', 'views', 'controllers', 'helpers', 'service_integrators'],
	config: ['database', 'routes', 'bookshelf'],
	migrations: ['raw_sql'],
	public:[],
	test: ['integration', 'unit']
}
var coreDependencies = ['body-parser', 'express', 'knex', 'lodash', 'moment', 'bookshelf']
var optionalDependencies = {
	db: {
    postgres: 'pg',
    sqlite3: 'sqlite3',
    mysql: 'mysql2',
    mariadb:'mariasql',
    oracle: 'strong-oracle',
    mssql: 'mssql',
    default: 'pg'
	}
}
var coreDevDependencies = ['mocha', 'dotenv', 'chai', 'faker', 'factory-girl', 'factory-girl-bookshelf']

function generateInitialStructure(appName, structure) {
	return new Promise((resolve, reject) => {
		_.forEach(structure, function(subdirs, dirname) {
		  fs.ensureDir(dirname)
		  .then(() => {
		  	var subDirsCreationPromises = _.map(subdirs, subdirName => {
		  		var newPath = dirname+'/'+subdirName
		  		return new Promise((resolve, reject) => {
		  			fs.ensureDir(newPath)
		  				.then(() => {
			  				var _indexFilePath = path.join(__dirname, 'templates', dirname, subdirName, '_index.js')
			  				return fs.copy(_indexFilePath, newPath + '/index.js')
		  				})
		  				.then(() => {
		  					resolve()
		  				})
		  				.catch(error => {
		  					reject(error)
		  				})
		  		})
		  		return 
		  	})
		  	return Promise.all(subDirsCreationPromises)
		  })
		  .then(() => {
				var _indexFilePath = path.join(__dirname, 'templates', dirname, '_index.js')
				return fs.readFile(_indexFilePath, 'utf8')
		  })
		  .then(mustacheFile => {
				var mustacheData = {
					APP_NAME: _.capitalize(_.snakeCase(appName)),
					APP_DB: _.snakeCase(appName)
				}
				var template = mustache.render(mustacheFile, mustacheData)
				var filePath =  path.join(process.cwd(), dirname, 'index.js')
				return fs.writeFile(filePath, template)
		  })
		  .then(() => {
		  	resolve()
		  })
		  .catch(err => {
		  	reject(err)
		  })
		});
	})
}

function generateDepenencies(appName,coreDependencies, optionalDependencies, devDependencies) {
	return new Promise((resolve, reject) => {
		var dependencies = _.concat(coreDependencies, optionalDependencies)
		var jsonPackagePath = path.join(__dirname, 'templates', '_package.json')
		fs.readJson(jsonPackagePath, 'utf8')
			.then(packageObj => {
				var dependenciesObj = {}
				var devDependenciesObj = {}

				_.each(dependencies, dependency => {
					dependenciesObj[dependency] = "*"
				})
				_.each(devDependencies, devDependency => {
					devDependenciesObj[devDependency] = "*"
				})

				packageObj.dependencies = dependenciesObj
				packageObj.devDependencies = devDependenciesObj
				packageObj.name = appName
				var options ={
					spaces: '\t'
				}
				return fs.writeJson('package.json', packageObj, options)
			})
			.then(() => {
				return shellCommand('npm update --save')
			})
			.then(() => {
				return shellCommand('npm update -D')
			})
			.then(() => {
						console.log('Dependencies created')
						resolve()
			})
			.catch(err => {
				console.log('Error while generating dependencies: ', err)
				reject(err)
			})	
	})
}

function gitTracking() {
	return new Promise((resolve, reject) => {
		var gitignoreTemplatePath = path.join(__dirname, 'templates', '_.gitignore')
		var gitignoreFilePath = process.cwd() + '/.gitignore'
		fs.copy(gitignoreTemplatePath, gitignoreFilePath, 'utf8')
		.then(() => {
			return shellCommand('git init')
		})
		.then(() => {
			return shellCommand('git add .')
		})
		.then(() => {
			return shellCommand('git commit -m "First Commit"')
		})
		.then(() => {
			console.log('Git Initialization finished.')
			resolve()
		})
		.catch(error => {
			console.log('Some error happened: ', error)
			reject(error)
		})
	})
}

function dotenvConfig(appName){
	return new Promise((resolve, reject) => {
		var dotenvPath = path.join(__dirname, 'templates', '_.env')
		fs.readFile(dotenvPath, 'utf8')
			.then(dotenvFileTemplate => {
				var mustacheData = {
					APP_NAME: _.capitalize(_.snakeCase(appName)),
					APP_DB: _.snakeCase(appName)
				}
				var template = mustache.render(dotenvFileTemplate, mustacheData)
				var dotEnvFilePath = process.cwd() + '/.env'
				return fs.writeFile(dotEnvFilePath, template)
			})
			.then(() => {
				console.log('.env File was created')
				resolve()
			})
			.catch(error => {
				reject(error)
			})
	})
}

function generate(args) {
	var selectedDB = optionalDependencies.db[args.selectedDB]
	var executionSteps = [
		generateInitialStructure(args.appName, structure),
		generateDepenencies(args.appName, coreDependencies, [selectedDB], coreDevDependencies),
		gitTracking(),
		dotenvConfig(args.appName)
	]
	Promise.all(executionSteps)
	.then(() => {
		console.log('App ' + args.appName + ' has been created.')
	})
	.catch(error => {
	})
}


module.exports = {
	generateInitialStructure: generateInitialStructure,
	generateDepenencies: generateDepenencies,
	gitTracking: gitTracking,
	dotenvConfig: dotenvConfig,
	generate: generate
}