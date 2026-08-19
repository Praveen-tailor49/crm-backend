const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
  try {
    // Parse the DATABASE_URL to get credentials, but connect without DB name
    const url = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
    });
    
    const dbName = url.pathname.slice(1); // Remove leading slash
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database ${dbName} created successfully or already exists.`);
    
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

createDb();
