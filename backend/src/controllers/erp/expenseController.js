const { Expense, User } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const where = {};
    if (req.user.role !== 'superadmin') where.branchId = req.user.branchId;
    else if (req.query.branchId) where.branchId = req.query.branchId;
    if (category) where.category = category;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };
    const { count, rows } = await Expense.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', foreignKey: 'createdBy', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['date', 'DESC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const branchId = req.user.role === 'superadmin' ? req.body.branchId : req.user.branchId;
    const expense = await Expense.create({ ...req.body, branchId, createdBy: req.user.id });
    return success(res, { expense }, 'Xarajat qo\'shildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return error(res, 'Topilmadi', 404);
    await expense.update(req.body);
    return success(res, { expense }, 'Yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return error(res, 'Topilmadi', 404);
    await expense.destroy();
    return success(res, {}, 'O\'chirildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
