import pg from "pg";
const { Pool } = pg;

const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  statement_timeout: 10000, 
  query_timeout: 10000,  
});

connectionPool.on("error", (err) => {
  console.error("[Supabase] Lost connection to Supabase,", err.message);
});

export default connectionPool;
