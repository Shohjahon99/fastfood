const sequelize = require('../config/database');
const User = require('./User');
const Branch = require('./Branch');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Inventory = require('./Inventory');
const Expense = require('./Expense');
const Customer = require('./Customer');
const Shift = require('./Shift');
const Application = require('./Application');
const Settings = require('./Settings');

// User - Branch
User.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branchId', as: 'staff' });
Branch.belongsTo(User, { foreignKey: 'directorId', as: 'director' });

// Product - Category
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Order associations
Order.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(Order, { foreignKey: 'branchId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });

// OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Inventory, Expense, Shift - Branch
Inventory.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(Inventory, { foreignKey: 'branchId', as: 'inventory' });
Expense.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(Expense, { foreignKey: 'branchId', as: 'expenses' });
Shift.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Shift.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

Settings.belongsTo(User, { foreignKey: 'directorId', as: 'director' });

module.exports = {
  sequelize,
  User, Branch, Category, Product,
  Order, OrderItem, Inventory,
  Expense, Customer, Shift, Application, Settings,
};
