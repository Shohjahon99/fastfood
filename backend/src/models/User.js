const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(20) },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'cashier',
  },
  branchId: { type: DataTypes.INTEGER, allowNull: true },
  tenantId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  avatar: { type: DataTypes.STRING(255) },
  lastLogin: { type: DataTypes.DATE },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
