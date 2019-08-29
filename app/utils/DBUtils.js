const getKnex = (knex, tableName, trx) => trx ? knex(tableName).transacting(trx) : knex(tableName)

module.exports = {getKnex}
