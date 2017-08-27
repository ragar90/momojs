#!/usr/bin/env node
var initGenerator = require('./generators/init')
require('yargs')
  .command('init', 'Initialize the proyect folder with the necessary structure and boilerplate files', (yargs) => {
  	return yargs.option('database', {
	      alias: 'd',
	      default: 'postgres',
	      choices: ['postgres', 'sqlite3', 'mysql', 'mariadb', 'oracle', 'mssql', ]
	    }) 
  	}, (argv) => {
  		console.log('=====> Generating main proyect structure')
  		var initParams = {
  			selectedDB: argv.database,
  			appName: argv.name
  		}
	    initGenerator.generate(initParams)
	  }
	)
	.command('controller', 'Create Scafold for new controller', () => {}, (argv) => {
		console.log('received args for controller: ', argv)
	})
	.command('model', 'Create Scafold model with knex migrations', () => {}, (argv) => {
		console.log('received args for model: ', argv)
	})
	.demandOption('name', 'Please provide both run and path arguments to work with this tool')
  .help()
  .argv