const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shift = sequelize.define('Shift', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE },
  openingCash: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  closingCash: { type: DataTypes.DECIMAL(12, 2) },
  totalSales: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING(10), defaultValue: 'open' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'shifts',
  timestamps: true,
});

module.exports = Shift;
