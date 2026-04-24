const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(20) },
  city: { type: DataTypes.STRING(100) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  openTime: { type: DataTypes.TIME, defaultValue: '08:00:00' },
  closeTime: { type: DataTypes.TIME, defaultValue: '23:00:00' },
  directorId: { type: DataTypes.INTEGER },
  tenantId: { type: DataTypes.INTEGER, allowNull: true },
  monthlyTarget: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, {
  tableName: 'branches',
  timestamps: true,
});

module.exports = Branch;
