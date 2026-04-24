const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL;
const pgHost = process.env.PGHOST;

if (dbUrl) {
  // Production: PostgreSQL via URL
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (pgHost) {
  // Production: PostgreSQL via individual vars
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Local: SQLite
  const path = require('path');
  const sqlite3 = require('sqlite3');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
