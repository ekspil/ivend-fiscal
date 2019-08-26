exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable("receipts", function (table) {
            table.increments()
            table.text("email").notNull()
            table.text("inn").notNull()
            table.text("sno").notNull()
            table.text("place").notNull()
            table.text("item_name").notNull()
            table.decimal("item_price").notNull()
            table.text("payment_type").notNull()
            table.text("ext_id").unique().nullable()
            table.bigInteger("fiscal_data_id").nullable()
            table.text("status").notNull()
            table.dateTime("created_at").notNullable()
        }),
        knex.schema.createTable("fiscal_datas", function (table) {
            table.increments()
            table.text("ext_id").notNull()
            table.decimal("total_amount").notNull()
            table.text("fns_site").notNull()
            table.text("fn_number").notNull()
            table.text("shift_number").notNull()
            table.text("receipt_date_time").notNull()
            table.text("fiscal_receipt_number").notNull()
            table.text("fiscal_document_number").notNull()
            table.text("ect_registration_number").notNull()
            table.text("fiscal_document_attribute").notNull()
            table.dateTime("ext_timestamp").notNull()
            table.dateTime("created_at").notNull()
        })
    ])
}

exports.down = async function () {
    throw new Error("All down operations should be resolved manually")
}
