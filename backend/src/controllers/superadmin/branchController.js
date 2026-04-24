const { Branch, User, Order, sequelize } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    const { count, rows } = await Branch.findAndCountAll({
      where,
      include: [{ model: User, as: 'director', attributes: ['id', 'name', 'email', 'phone'] }],
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
    const branch = await Branch.findByPk(req.params.id, {
      include: [
        { model: User, as: 'director', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'staff', attributes: ['id', 'name', 'role', 'isActive'] },
      ],
    });
    if (!branch) return error(res, 'Filial topilmadi', 404);
    return success(res, { branch });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    return success(res, { branch }, 'Filial yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return error(res, 'Filial topilmadi', 404);
    await branch.update(req.body);
    return success(res, { branch }, 'Filial yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return error(res, 'Filial topilmadi', 404);
    await branch.update({ isActive: false });
    return success(res, {}, 'Filial o\'chirildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const where = { branchId: id };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }
    const orders = await Order.findAll({ where });
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const totalOrders = orders.length;
    return success(res, { totalSales, totalOrders, orders });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
