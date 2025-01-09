import { db } from './connection.js';

async function setupDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_routines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        routine_data MEDIUMTEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Database setup complete");
  } catch (err) {
    console.error("Error setting up the database: ", err.message);
  } finally {
    await db.end();
    console.log("Database connection closed");
  }
};

setupDatabase();