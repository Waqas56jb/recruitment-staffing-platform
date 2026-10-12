require('dotenv').config()
const { Client } = require('pg')

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  const tables = await client.query(`
    select table_schema, table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `)
  console.log(tables.rows.map((row) => row.table_name).join('\n'))
  await client.end()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
