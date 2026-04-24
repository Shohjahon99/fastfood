const { Customer, Order } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['totalSpent', 'DESC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const existing = await Customer.findOne({ where: { phone: req.body.phone } });
    if (existing) return success(res, { customer: existing }, 'Mijoz topildi');
    const customer = await Customer.create(req.body);
    return success(res, { customer }, 'Mijoz qo\'shildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: Order, as: 'orders', limit: 10, order: [['createdAt', 'DESC']] }],
    });
    if (!customer) return error(res, 'Topilmadi', 404);
    return success(res, { customer });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.findByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { phone: req.params.phone } });
    if (!customer) return error(res, 'Topilmadi', 404);
    return success(res, { customer });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
