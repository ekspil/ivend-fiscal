exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table("receipts", function (table) {
            table.boolean("not_repeat")
        })
    ])
}


exports.down = async function () {
    throw new Error("All down operations should be resolved manually")
}
