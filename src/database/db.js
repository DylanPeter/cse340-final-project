import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
    filename: './src/database/db.sqlite-journal',  // Path to your DB file
    driver: sqlite3.Database
});

export default db;
