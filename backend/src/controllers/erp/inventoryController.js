const { Inventory, sequelize } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, low } = req.query;
    const branchId = req.user.role === 'superadmin' ? req.query.branchId : req.user.branchId;
    const where = {};
    if (branchId) where.branchId = branchId;
    if (low === 'true') where.quantity = { [Op.lte]: sequelize.col('minQuantity') };
    const { count, rows } = await Inventory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['name', 'ASC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const branchId = req.user.role === 'superadmin' ? req.body.branchId : req.user.branchId;
    const item = await Inventory.create({ ...req.body, branchId });
    return success(res, { item }, 'Qo\'shildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return error(res, 'Topilmadi', 404);
    await item.update(req.body);
    return success(res, { item }, 'Yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return error(res, 'Topilmadi', 404);
    await item.increment('quantity', { by: quantity });
    await item.reload();
    return success(res, { item }, `${quantity} ${item.unit} qo\'shildi`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
