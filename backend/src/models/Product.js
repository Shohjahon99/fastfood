const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  nameUz: { type: DataTypes.STRING(150) },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  costPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  categoryId: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING(255) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  tenantId: { type: DataTypes.INTEGER, allowNull: true },
  prepTime: { type: DataTypes.INTEGER, defaultValue: 10 },
  calories: { type: DataTypes.INTEGER },
  barcode: { type: DataTypes.STRING(50) },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
