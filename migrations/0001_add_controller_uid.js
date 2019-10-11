exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table("receipts", function (table) {
            table.text("controller_uid")
        })
    ])
}

exports.down = async function () {
    throw new Error("All down operations should be resolved manually")
}
