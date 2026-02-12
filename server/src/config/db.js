import pg from 'pg'
const { Pool } = pg;

const connectionPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10
})

export default connectionPool;