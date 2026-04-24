const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  unit: { type: DataTypes.STRING(20), defaultValue: 'kg' },
  quantity: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
  minQuantity: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
  costPerUnit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  category: { type: DataTypes.STRING(100) },
}, {
  tableName: 'inventory',
  timestamps: true,
});

module.exports = Inventory;
