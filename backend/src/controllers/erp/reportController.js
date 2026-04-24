const { Order, OrderItem, Product, Expense, Branch, sequelize } = require('../../models');
const { success, error } = require('../../utils/response');
const { Op } = require('sequelize');

const getDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    return { [Op.between]: [new Date(startDate + 'T00:00:00'), new Date(endDate + 'T23:59:59')] };
  }
  const d = new Date();
  return { [Op.gte]: new Date(d.getFullYear(), d.getMonth(), 1) };
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: { [Op.ne]: 'cancelled' }, paymentStatus: 'paid' };
    if (req.user.role !== 'superadmin') where.branchId = req.user.branchId;
    else if (req.query.branchId) where.branchId = parseInt(req.query.branchId);
    where.createdAt = getDateRange(startDate, endDate);

    const [dailySales, topProducts] = await Promise.all([
      Order.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('Order.createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
          [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
        ],
        group: [sequelize.fn('DATE', sequelize.col('Order.createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('Order.createdAt')), 'ASC']],
        raw: true,
      }),
      OrderItem.findAll({
        include: [
          { model: Order, as: 'order', where, attributes: [] },
          { model: Product, as: 'product', attributes: ['id', 'name', 'image'] },
        ],
        attributes: [
          'productId',
          [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQty'],
          [sequelize.fn('SUM', sequelize.col('OrderItem.total')), 'totalRevenue'],
        ],
        group: ['productId', 'product.id', 'product.name', 'product.image'],
        order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
        limit: 10,
        raw: true,
      }),
    ]);

    const totalRevenue = dailySales.reduce((s, o) => s + parseFloat(o.revenue || 0), 0);
    const totalOrders = dailySales.reduce((s, o) => s + parseInt(o.orderCount || 0), 0);

    return success(res, { dailySales, topProducts, totalRevenue, totalOrders });
  } catch (err) {
    console.error('Sales report error:', err);
    return error(res, err.message, 500);
  }
};

exports.getProfitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const branchId = req.user.role !== 'superadmin' ? req.user.branchId : (req.query.branchId ? parseInt(req.query.branchId) : null);
    const dateRange = getDateRange(startDate, endDate);

    const revenueWhere = { status: { [Op.ne]: 'cancelled' }, paymentStatus: 'paid', createdAt: dateRange };
    const expenseWhere = { date: { [Op.between]: [startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], endDate || new Date().toISOString().split('T')[0]] } };
    if (branchId) { revenueWhere.branchId = branchId; expenseWhere.branchId = branchId; }

    const [rev, exp] = await Promise.all([
      Order.findOne({ where: revenueWhere, attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'total']], raw: true }),
      Expense.findOne({ where: expenseWhere, attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']], raw: true }),
    ]);

    const revenue = parseFloat(rev?.total || 0);
    const expenses = parseFloat(exp?.total || 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return success(res, { revenue, expenses, profit, margin });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getBranchComparison = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = getDateRange(startDate, endDate);
    const branchWhere = req.user.role === 'director' ? { directorId: req.user.id } : {};

    const branches = await Branch.findAll({
      where: branchWhere,
      include: [{
        model: Order, as: 'orders',
        where: { createdAt: dateRange, status: { [Op.ne]: 'cancelled' } },
        required: false,
        attributes: [],
      }],
      attributes: [
        'id', 'name', 'city', 'isActive',
        [sequelize.fn('COUNT', sequelize.col('orders.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('orders.total')), 'revenue'],
        [sequelize.fn('AVG', sequelize.col('orders.total')), 'avgOrder'],
      ],
      group: ['Branch.id'],
      order: [[sequelize.fn('SUM', sequelize.col('orders.total')), 'DESC']],
    });

    return success(res, { branches });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
