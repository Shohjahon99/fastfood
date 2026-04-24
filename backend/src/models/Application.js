const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Fastfoot markazlari ariza yuborish uchun
const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING(200), allowNull: false },
  contactName: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  city: { type: DataTypes.STRING(100) },
  address: { type: DataTypes.TEXT },
  branchCount: { type: DataTypes.INTEGER, defaultValue: 1 },
  message: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' }, // pending, approved, rejected
  rejectedReason: { type: DataTypes.TEXT },
  approvedAt: { type: DataTypes.DATE },
  // Tasdiqlanganda yaratilgan director login
  directorEmail: { type: DataTypes.STRING(150) },
  directorPassword: { type: DataTypes.STRING(100) },
  tenantId: { type: DataTypes.INTEGER }, // Branch/Company ID
}, {
  tableName: 'applications',
  timestamps: true,
});

module.exports = Application;
