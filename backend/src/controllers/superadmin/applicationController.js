const { Application, User, Branch } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await Application.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return error(res, 'Ariza topilmadi', 404);
    return success(res, { application: app });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.approve = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return error(res, 'Ariza topilmadi', 404);
    if (app.status !== 'pending') return error(res, 'Bu ariza allaqachon ko\'rib chiqilgan');

    // Director email va parol yaratish
    const directorEmail = `director@${app.companyName.toLowerCase().replace(/\s+/g, '')}.uz`;
    const directorPassword = `FF${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;

    // Asosiy filial yaratish
    const branch = await Branch.create({
      name: app.companyName,
      address: app.address || app.city,
      city: app.city,
      phone: app.phone,
      isActive: true,
    });

    // Director yaratish
    const director = await User.create({
      name: app.contactName,
      email: directorEmail,
      password: directorPassword,
      phone: app.phone,
      role: 'director',
      branchId: branch.id,
      isActive: true,
    });

    // tenantId = director.id (har bir director o'z tenantidir)
    await director.update({ tenantId: director.id });
    await branch.update({ directorId: director.id, tenantId: director.id });

    await app.update({
      status: 'approved',
      approvedAt: new Date(),
      directorEmail,
      directorPassword,
      tenantId: branch.id,
    });

    return success(res, {
      application: app,
      director: { email: directorEmail, password: directorPassword },
      branch,
    }, 'Ariza tasdiqlandi. Director yaratildi.');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const app = await Application.findByPk(req.params.id);
    if (!app) return error(res, 'Topilmadi', 404);
    await app.update({ status: 'rejected', rejectedReason: reason || 'Sabab ko\'rsatilmagan' });
    return success(res, { application: app }, 'Ariza rad etildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Application.count(),
      Application.count({ where: { status: 'pending' } }),
      Application.count({ where: { status: 'approved' } }),
      Application.count({ where: { status: 'rejected' } }),
    ]);
    return success(res, { total, pending, approved, rejected });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
