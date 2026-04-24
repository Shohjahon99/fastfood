const jwt = require('jsonwebtoken');
const { User, Branch } = require('../../models');
const { success, error } = require('../../utils/response');

const generateToken = (user) => jwt.sign(
  { id: user.id, role: user.role, branchId: user.branchId },
  process.env.JWT_SECRET || 'fastfoot-erp-secret-2025',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validatsiya
    if (!email || !password) return error(res, 'Email va parol kiritilishi shart', 400);
    if (!isValidEmail(email)) return error(res, 'Email formati noto\'g\'ri', 400);
    if (password.length < 6) return error(res, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 400);

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim(), isActive: true },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name', 'address'] }],
    });

    if (!user || !(await user.checkPassword(password))) {
      return error(res, 'Email yoki parol noto\'g\'ri', 401);
    }

    await user.update({ lastLogin: new Date() });
    const token = generateToken(user);

    return success(res, { token, user }, 'Tizimga muvaffaqiyatli kirdingiz');
  } catch (err) {
    console.error('Login error:', err.message);
    return error(res, 'Server xatosi', 500);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
    });
    if (!user) return error(res, 'Foydalanuvchi topilmadi', 404);
    return success(res, { user });
  } catch (err) {
    return error(res, 'Server xatosi', 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return error(res, 'Eski va yangi parol kiritilishi shart');
    if (newPassword.length < 8) return error(res, 'Yangi parol kamida 8 ta belgi bo\'lishi kerak');
    if (newPassword === oldPassword) return error(res, 'Yangi parol eski paroldan farq qilishi kerak');

    const user = await User.findByPk(req.user.id);
    if (!(await user.checkPassword(oldPassword))) return error(res, 'Eski parol noto\'g\'ri', 401);

    await user.update({ password: newPassword });
    return success(res, {}, 'Parol muvaffaqiyatli o\'zgartirildi');
  } catch (err) {
    return error(res, 'Server xatosi', 500);
  }
};
