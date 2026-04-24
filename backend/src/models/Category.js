const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  nameUz: { type: DataTypes.STRING(100) },
  icon: { type: DataTypes.STRING(100) },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  tenantId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;
