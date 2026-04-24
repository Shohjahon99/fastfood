const { User, Branch } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, branchId, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (branchId) where.branchId = parseInt(branchId);
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
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
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
    });
    if (!user) return error(res, 'Topilmadi', 404);
    return success(res, { user });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, phone, role, branchId } = req.body;
    if (!name || !email || !password) return error(res, 'Ism, email va parol majburiy');
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return error(res, 'Bu email allaqachon ro\'yxatdan o\'tgan');
    const user = await User.create({ name, email: email.toLowerCase(), password, phone, role: role || 'cashier', branchId: branchId || null });
    return success(res, { user }, 'Foydalanuvchi yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    const { password, email, ...data } = req.body;
    if (email) data.email = email.toLowerCase();
    if (password && password.trim()) data.password = password;
    await user.update(data);
    return success(res, { user }, 'Yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    if (user.role === 'superadmin') return error(res, 'Super adminni bloklash mumkin emas');
    await user.update({ isActive: !user.isActive });
    return success(res, { user }, user.isActive ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return error(res, 'Parol kamida 8 belgi bo\'lishi kerak');
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    await user.update({ password: newPassword });
    return success(res, {}, `${user.name} ning paroli o\'zgartirildi`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
