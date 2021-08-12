exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table("receipts", function (table) {
            table.text("rekassa_password")
            table.text("rekassa_number")
            table.text("rekassa_kkt_id")
        })
    ])
}


exports.down = async function () {
    throw new Error("All down operations should be resolved manually")
}
