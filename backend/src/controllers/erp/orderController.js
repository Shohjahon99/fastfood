const { Order, OrderItem, Product, Customer, User, Branch } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');

const generateOrderNumber = () => {
  const date = new Date();
  const prefix = `FF${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${random}`;
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, date } = req.query;
    const where = {};
    if (req.user.role !== 'superadmin') where.branchId = req.user.branchId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      where.createdAt = { [Op.between]: [d, next] };
    }
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image'] }] },
        { model: User, as: 'cashier', attributes: ['id', 'name'] },
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { items, type, tableNumber, paymentMethod, customerId, notes, deliveryAddress } = req.body;
    if (!items || items.length === 0) return error(res, 'Buyurtma bo\'sh bo\'lishi mumkin emas');

    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return error(res, `Mahsulot topilmadi: ${item.productId}`, 404);
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      enrichedItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, total: itemTotal, notes: item.notes });
    }

    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      branchId: req.user.branchId,
      cashierId: req.user.id,
      type: type || 'dine_in',
      tableNumber,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      subtotal,
      tax,
      total,
      customerId,
      notes,
      deliveryAddress,
    });

    await OrderItem.bulkCreate(enrichedItems.map(i => ({ ...i, orderId: order.id })));

    if (customerId) {
      await Customer.increment(
        { totalOrders: 1, totalSpent: total, bonusPoints: Math.floor(total / 1000) },
        { where: { id: customerId } }
      );
    }

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    return success(res, { order: fullOrder }, 'Buyurtma yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return error(res, 'Buyurtma topilmadi', 404);
    const updates = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    await order.update(updates);
    return success(res, { order }, 'Buyurtma holati yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'cashier', attributes: ['id', 'name'] },
        { model: Customer, as: 'customer' },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
      ],
    });
    if (!order) return error(res, 'Topilmadi', 404);
    return success(res, { order });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
