import db from './src/database/db.js';
import fs from 'fs';

// Read and execute setup.sql
const setupSQL = fs.readFileSync('./src/database/setup.sql', 'utf8');

db.exec(setupSQL);
console.log('Database initialized successfully.');
