const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\\/g, '') : '';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;