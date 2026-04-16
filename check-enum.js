import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
const pool = new pg.Pool();
pool.query(`SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'sources_source_type_check'`).then(r => { 
    console.log(r.rows); 
    process.exit(0); 
}).catch(e => {
    console.log(e);
    process.exit(1);
});
