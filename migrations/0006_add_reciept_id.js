exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table("receipts", function (table) {
            table.bigInteger("sale_id").unique().nullable()
        })
    ])
}


exports.down = async function () {
    throw new Error("All down operations should be resolved manually")
}
