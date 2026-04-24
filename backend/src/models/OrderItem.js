const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  notes: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
}, {
  tableName: 'order_items',
  timestamps: true,
});

module.exports = OrderItem;
