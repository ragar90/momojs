var config = require('../../config')
console.log('Connecting to: ', config.DATABASE_URL)
var knex = require('knex')({
  client: 'pg',
  connection: config.DATABASE_URL,
  searchPath: 'knex,public'
});

module.exports = knex