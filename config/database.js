const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('digiweb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Set to true to see SQL queries in console
});

module.exports = sequelize;
