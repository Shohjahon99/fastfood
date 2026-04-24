const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const { User, Branch, Settings, Order } = require('../../models');
const { Op } = require('sequelize');
const { success, error } = require('../../utils/response');

const directors = ['superadmin', 'director'];

router.use(authenticate, authorize(...directors));

// ─── STAFF ────────────────────────────────────────────────────────────────────

// GET /admin/staff — xodimlar ro'yxati (tenant bo'yicha filter)
router.get('/staff', async (req, res) => {
  try {
    const { search, role, branchId, isActive } = req.query;
    const where = { role: { [Op.ne]: 'superadmin' } };

    // Director faqat o'z tenantining xodimlarini ko'radi
    if (req.user.role === 'director') {
      where.tenantId = req.user.tenantId;
    }

    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
    if (role) where.role = role;
    if (branchId) where.branchId = parseInt(branchId);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await User.findAll({
      where,
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });
    return success(res, { users });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// POST /admin/staff — yangi xodim yaratish
router.post('/staff', async (req, res) => {
  try {
    const { name, email, password, phone, role, branchId } = req.body;
    if (!name || !email || !password) return error(res, 'Ism, email va parol majburiy');
    const allowedRoles = ['manager', 'cashier', 'waiter', 'cook', 'courier'];
    if (!allowedRoles.includes(role)) return error(res, 'Noto\'g\'ri lavozim');

    // Director faqat o'z tenantining filialiga xodim qo'sha oladi
    if (req.user.role === 'director' && branchId) {
      const branch = await Branch.findOne({ where: { id: branchId, tenantId: req.user.tenantId } });
      if (!branch) return error(res, 'Bu filial sizga tegishli emas', 403);
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return error(res, 'Bu email allaqachon ro\'yxatdan o\'tgan');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      branchId: branchId || null,
      tenantId: req.user.tenantId || null,
    });
    return success(res, { user }, 'Xodim qo\'shildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// PUT /admin/staff/:id — xodimni tahrirlash
router.put('/staff/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    if (user.role === 'superadmin' || user.role === 'director') return error(res, 'Bu foydalanuvchini tahrirlash mumkin emas', 403);

    // Tenant tekshiruvi
    if (req.user.role === 'director' && user.tenantId !== req.user.tenantId) {
      return error(res, 'Ruxsat yo\'q', 403);
    }

    const { password, email, ...data } = req.body;
    if (email) data.email = email.toLowerCase();
    if (password && password.trim()) data.password = password;
    await user.update(data);
    return success(res, { user }, 'Yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// PATCH /admin/staff/:id/toggle — faol/nofaol
router.patch('/staff/:id/toggle', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    if (['superadmin', 'director'].includes(user.role)) return error(res, 'Bu foydalanuvchini bloklash mumkin emas');

    if (req.user.role === 'director' && user.tenantId !== req.user.tenantId) {
      return error(res, 'Ruxsat yo\'q', 403);
    }

    await user.update({ isActive: !user.isActive });
    return success(res, { user }, user.isActive ? 'Faollashtirildi' : 'Bloklandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// PATCH /admin/staff/:id/reset-password — parol tiklash
router.patch('/staff/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return error(res, 'Parol kamida 6 belgi bo\'lishi kerak');
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    if (['superadmin', 'director'].includes(user.role)) return error(res, 'Bu foydalanuvchining parolini o\'zgartirish mumkin emas');

    if (req.user.role === 'director' && user.tenantId !== req.user.tenantId) {
      return error(res, 'Ruxsat yo\'q', 403);
    }

    await user.update({ password: newPassword });
    return success(res, {}, `${user.name} ning paroli o'zgartirildi`);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// DELETE /admin/staff/:id — xodimni o'chirish
router.delete('/staff/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Topilmadi', 404);
    if (['superadmin', 'director'].includes(user.role)) return error(res, 'Bu foydalanuvchini o\'chirish mumkin emas', 403);

    if (req.user.role === 'director' && user.tenantId !== req.user.tenantId) {
      return error(res, 'Ruxsat yo\'q', 403);
    }

    await user.destroy();
    return success(res, {}, 'Xodim o\'chirildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// ─── BRANCHES-LIST (dropdown uchun) ───────────────────────────────────────────

// GET /admin/branches-list — filiallar ro'yxati (sodda, dropdown uchun)
router.get('/branches-list', async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'director') where.tenantId = req.user.tenantId;
    const branches = await Branch.findAll({ where, attributes: ['id', 'name', 'city'] });
    return success(res, { branches });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// ─── BRANCHES CRUD (to'liq) ───────────────────────────────────────────────────

// GET /admin/branches — filiallar (stats bilan)
router.get('/branches', async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'director') where.tenantId = req.user.tenantId;

    const branches = await Branch.findAll({
      where,
      include: [
        { model: User, as: 'director', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'staff', attributes: ['id', 'name', 'role', 'isActive'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Har bir filial uchun buyurtmalar sonini hisoblash
    const branchesWithStats = await Promise.all(
      branches.map(async (branch) => {
        const orderCount = await Order.count({ where: { branchId: branch.id } });
        const activeStaff = branch.staff ? branch.staff.filter(u => u.isActive).length : 0;
        return {
          ...branch.toJSON(),
          stats: { orderCount, activeStaff },
        };
      })
    );

    return success(res, { branches: branchesWithStats });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// POST /admin/branches — yangi filial yaratish
router.post('/branches', async (req, res) => {
  try {
    const { name, address, phone, city, openTime, closeTime, monthlyTarget } = req.body;
    if (!name) return error(res, 'Filial nomi majburiy');

    const branch = await Branch.create({
      name,
      address: address || null,
      phone: phone || null,
      city: city || null,
      openTime: openTime || '08:00:00',
      closeTime: closeTime || '23:00:00',
      monthlyTarget: parseFloat(monthlyTarget) || 0,
      isActive: true,
      directorId: req.user.id,
      tenantId: req.user.tenantId || null,
    });
    return success(res, { branch }, 'Filial yaratildi', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// PUT /admin/branches/:id — filialini tahrirlash
router.put('/branches/:id', async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'director') where.tenantId = req.user.tenantId;

    const branch = await Branch.findOne({ where });
    if (!branch) return error(res, 'Filial topilmadi yoki ruxsat yo\'q', 404);

    const { name, address, phone, city, openTime, closeTime, monthlyTarget, isActive } = req.body;
    await branch.update({
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(city !== undefined && { city }),
      ...(openTime !== undefined && { openTime }),
      ...(closeTime !== undefined && { closeTime }),
      ...(monthlyTarget !== undefined && { monthlyTarget: parseFloat(monthlyTarget) }),
      ...(isActive !== undefined && { isActive }),
    });
    return success(res, { branch }, 'Filial yangilandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// DELETE /admin/branches/:id — filialini o'chirish (faqat buyurtmalar bo'lmasa)
router.delete('/branches/:id', async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'director') where.tenantId = req.user.tenantId;

    const branch = await Branch.findOne({ where });
    if (!branch) return error(res, 'Filial topilmadi yoki ruxsat yo\'q', 404);

    const orderCount = await Order.count({ where: { branchId: branch.id } });
    if (orderCount > 0) {
      return error(res, `Bu filialda ${orderCount} ta buyurtma mavjud. O'chirishdan oldin buyurtmalarni ko'chirng yoki arxivlang.`, 400);
    }

    await branch.destroy();
    return success(res, {}, 'Filial o\'chirildi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

// ─── NAV SETTINGS ─────────────────────────────────────────────────────────────

const DEFAULT_NAV = {
  manager:  ['dashboard', 'pos', 'orders', 'products', 'inventory', 'customers', 'expenses', 'reports'],
  cashier:  ['dashboard', 'pos', 'orders', 'customers'],
  waiter:   ['dashboard', 'pos', 'orders'],
  cook:     ['dashboard', 'orders'],
  courier:  ['dashboard', 'orders'],
};

router.get('/nav-settings', async (req, res) => {
  try {
    const directorId = req.user.role === 'director' ? req.user.id : null;
    if (!directorId) return success(res, { nav: DEFAULT_NAV });
    const settings = await Settings.findOne({ where: { directorId } });
    return success(res, { nav: settings?.navPermissions || DEFAULT_NAV });
  } catch (err) {
    return error(res, err.message, 500);
  }
});

router.put('/nav-settings', async (req, res) => {
  try {
    const directorId = req.user.role === 'director' ? req.user.id : req.body.directorId;
    if (!directorId) return error(res, 'Director ID kerak');
    const { nav } = req.body;
    if (!nav || typeof nav !== 'object') return error(res, 'Nav sozlamalari noto\'g\'ri');

    const [settings] = await Settings.findOrCreate({ where: { directorId }, defaults: { navPermissions: nav } });
    if (settings.navPermissions !== nav) await settings.update({ navPermissions: nav });
    return success(res, { nav: settings.navPermissions }, 'Sozlamalar saqlandi');
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
