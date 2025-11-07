import fs from 'fs';
import path from 'path';
import { pool } from '../database/db.js';
import dotenv from 'dotenv';
dotenv.config();

const runSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running ${path.basename(filePath)}...`);
  await pool.query(sql);
  console.log(`Finished ${path.basename(filePath)}`);
};

const migrate = async () => {
  try {
    const base = path.resolve(new URL('.', import.meta.url).pathname, '../database');
    const schema = path.join(base, 'schema.sql');
    const rls = path.join(base, 'rls_policies.sql');

    await runSqlFile(schema);
    await runSqlFile(rls);

    console.log('Migration completed successfully.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();
