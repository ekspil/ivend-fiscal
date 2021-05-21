module.exports = {
    development: {
        client: "postgresql",
        connection: {
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations"
        }
    },
    staging: {
        client: "postgresql",
        connection: {
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations"
        }
    },
    production: {
        client: "postgresql",
        connection: {
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations"
        }
    }

}
