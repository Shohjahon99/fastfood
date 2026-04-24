const { Branch, User, Order, sequelize } = require('../../models');
const { success, error } = require('../../utils/response');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBranches,
      activeBranches,
      totalUsers,
      todayOrders,
      monthOrders,
    ] = await Promise.all([
      Branch.count(),
      Branch.count({ where: { isActive: true } }),
      User.count({ where: { isActive: true } }),
      Order.findAll({
        where: { createdAt: { [Op.gte]: today }, status: { [Op.ne]: 'cancelled' } },
        attributes: [[sequelize.fn('SUM', sequelize.col('total')), 'total']],
      }),
      Order.findAll({
        where: {
          createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) },
          status: { [Op.ne]: 'cancelled' },
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
      }),
    ]);

    const branchStats = await Branch.findAll({
      include: [{
        model: Order,
        as: 'orders',
        where: { createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) } },
        required: false,
        attributes: [],
      }],
      attributes: [
        'id', 'name', 'isActive',
        [sequelize.fn('COUNT', sequelize.col('orders.id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('orders.total')), 'revenue'],
      ],
      group: ['Branch.id'],
    });

    return success(res, {
      totalBranches,
      activeBranches,
      totalUsers,
      todaySales: parseFloat(todayOrders[0]?.dataValues?.total || 0),
      monthSales: parseFloat(monthOrders[0]?.dataValues?.total || 0),
      monthOrders: parseInt(monthOrders[0]?.dataValues?.count || 0),
      branchStats,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
