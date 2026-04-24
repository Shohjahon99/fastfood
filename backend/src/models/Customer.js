const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), unique: true },
  email: { type: DataTypes.STRING(150) },
  birthDate: { type: DataTypes.DATEONLY },
  bonusPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  address: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'customers',
  timestamps: true,
});

module.exports = Customer;
