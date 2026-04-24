const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING(20), unique: true },
  branchId: { type: DataTypes.INTEGER, allowNull: false },
  cashierId: { type: DataTypes.INTEGER },
  tableNumber: { type: DataTypes.STRING(10) },
  type: { type: DataTypes.STRING(20), defaultValue: 'dine_in' },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paymentMethod: { type: DataTypes.STRING(20), defaultValue: 'cash' },
  paymentStatus: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT },
  customerId: { type: DataTypes.INTEGER },
  deliveryAddress: { type: DataTypes.TEXT },
  courierId: { type: DataTypes.INTEGER },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
