const { Product, Category } = require('../../models');
const { success, error, paginate } = require('../../utils/response');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 100, categoryId, search, isActive } = req.query;
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (isActive !== undefined && isActive !== '') where.isActive = isActive === 'true';

    // Tenant filterlash: har bir tenant faqat o'z mahsulotlarini ko'radi
    if (req.user.tenantId) where.tenantId = req.user.tenantId;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['name', 'ASC']],
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, costPrice, categoryId, prepTime, calories, description, barcode, isActive } = req.body;
    if (!name || name.trim() === '') return error(res, 'Mahsulot nomi kiritilishi shart');
    if (!price || isNaN(price)) return error(res, 'Narx to\'g\'ri kiritilishi shart');

    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      costPrice: parseFloat(costPrice) || 0,
      categoryId: categoryId ? parseInt(categoryId) : null,
      prepTime: parseInt(prepTime) || 10,
      calories: calories ? parseInt(calories) : null,
      description: description || null,
      barcode: barcode || null,
      image: imageUrl,
      isActive: isActive !== 'false',
      tenantId: req.user.tenantId || null,
    });

    const full = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }],
    });
    return success(res, { product: full }, 'Mahsulot yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Mahsulot topilmadi', 404);

    // Tenant tekshiruvi
    if (req.user.tenantId && product.tenantId && product.tenantId !== req.user.tenantId) {
      return error(res, 'Bu mahsulotni tahrirlash uchun ruxsat yo\'q', 403);
    }

    const updates = { ...req.body };
    if (req.file) {
      // Eski rasmni o'chirish
      if (product.image) {
        const oldPath = path.join(__dirname, '../../../', product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = `/uploads/products/${req.file.filename}`;
    }
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.costPrice) updates.costPrice = parseFloat(updates.costPrice);
    if (updates.categoryId) updates.categoryId = parseInt(updates.categoryId);

    await product.update(updates);
    const full = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }],
    });
    return success(res, { product: full }, 'Yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Topilmadi', 404);

    // Tenant tekshiruvi
    if (req.user.tenantId && product.tenantId && product.tenantId !== req.user.tenantId) {
      return error(res, 'Bu mahsulotni o\'chirish uchun ruxsat yo\'q', 403);
    }

    await product.update({ isActive: false });
    return success(res, {}, 'O\'chirildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getCategories = async (req, res) => {
  try {
    let categories = [];

    if (req.user.tenantId) {
      // Avval shu tenantning kategoriyalarini olish
      categories = await Category.findAll({
        where: { isActive: true, tenantId: req.user.tenantId },
        order: [['order', 'ASC']],
      });

      // Agar tenant kategoriyasi bo'lmasa — umumiy (tenantId = null) kategoriyalarni ham ko'rsin
      if (categories.length === 0) {
        categories = await Category.findAll({
          where: { isActive: true, tenantId: null },
          order: [['order', 'ASC']],
        });
      }
    } else {
      // superadmin — tenantId yo'q, hammani ko'radi
      categories = await Category.findAll({
        where: { isActive: true },
        order: [['order', 'ASC']],
      });
    }

    return success(res, { categories });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, order } = req.body;
    if (!name) return error(res, 'Kategoriya nomi kerak');
    const category = await Category.create({
      name: name.trim(),
      icon: icon || '🍽️',
      order: parseInt(order) || 0,
      tenantId: req.user.tenantId || null,
    });
    return success(res, { category }, 'Kategoriya yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
