const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  category: { type: DataTypes.STRING(30), defaultValue: 'other' },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  createdBy: { type: DataTypes.INTEGER },
}, {
  tableName: 'expenses',
  timestamps: true,
});

module.exports = Expense;
