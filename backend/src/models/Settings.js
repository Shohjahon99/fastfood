const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  directorId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  navPermissions: {
    type: DataTypes.TEXT,
    defaultValue: null,
    get() {
      const raw = this.getDataValue('navPermissions');
      return raw ? JSON.parse(raw) : null;
    },
    set(val) {
      this.setDataValue('navPermissions', val ? JSON.stringify(val) : null);
    },
  },
}, {
  tableName: 'settings',
  timestamps: true,
});

module.exports = Settings;
