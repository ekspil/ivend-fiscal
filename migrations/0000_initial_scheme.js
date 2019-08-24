exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable("receipts", function (table) {
            table.increments()
            table.string("name").notNull()
            table.string("price").notNull()
            table.dateTime("created_at").notNullable()
        })
    ])
}

exports.down = async function (knex, Promise) {
    throw new Error("All down operations should be resolved manually")
}
