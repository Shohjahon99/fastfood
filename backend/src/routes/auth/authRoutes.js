const router = require('express').Router();
const authController = require('../../controllers/auth/authController');
const { authenticate } = require('../../middleware/auth');
const { Application } = require('../../models');
const { success, error } = require('../../utils/response');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, authController.changePassword);

// Ochiq ariza yuborish (login talab qilinmaydi)
router.post('/apply', async (req, res) => {
  try {
    const { companyName, contactName, phone, city, address, branchCount, message } = req.body;
    if (!companyName || !contactName || !phone) {
      return error(res, 'Kompaniya nomi, aloqa shaxsi va telefon majburiy');
    }
    // Email optional: kelmasa avtomatik temp email yaratiladi
    const email = req.body.email || `${phone.replace(/\D/g, '')}_${Date.now()}@apply.temp`;

    // Duplicate tekshiruvi: phone + companyName kombinatsiyasi bo'yicha
    const existing = await Application.findOne({ where: { phone, companyName } });
    if (existing) return error(res, 'Bu telefon raqam va markaz nomi bilan ariza allaqachon yuborilgan');

    const app = await Application.create({
      companyName,
      contactName,
      phone,
      email,
      city,
      address,
      branchCount: parseInt(branchCount) || 1,
      message,
    });
    return success(res, { id: app.id }, 'Arizangiz qabul qilindi! Tez orada bog\'lanamiz.', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
});

module.exports = router;
