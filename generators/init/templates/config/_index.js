if (!process.env.{{APP_NAME}}_ENV || process.env.{{APP_NAME}}_ENV === 'LOCAL') {
	require('dotenv').config()
}

module.exports ={
	DATABASE_URL: process.env.{{APP_NAME}}_ENV  !== 'TEST' ? process.env.DATABASE_URL : process.env.TEST_DATABASE_URL,
	VERBOSE: process.env.VERBOSE
}