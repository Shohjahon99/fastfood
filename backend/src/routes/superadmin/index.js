const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const branchCtrl = require('../../controllers/superadmin/branchController');
const userCtrl = require('../../controllers/superadmin/userController');
const dashCtrl = require('../../controllers/superadmin/dashboardController');
const appCtrl = require('../../controllers/superadmin/applicationController');

router.use(authenticate, authorize('superadmin'));

// Dashboard
router.get('/dashboard', dashCtrl.getStats);

// Arizalar (Fastfoot markazlari)
router.get('/applications', appCtrl.getAll);
router.get('/applications/stats', appCtrl.getStats);
router.get('/applications/:id', appCtrl.getOne);
router.patch('/applications/:id/approve', appCtrl.approve);
router.patch('/applications/:id/reject', appCtrl.reject);

// Filiallar (barcha tenantlar)
router.get('/branches', branchCtrl.getAll);
router.post('/branches', branchCtrl.create);
router.get('/branches/:id', branchCtrl.getOne);
router.put('/branches/:id', branchCtrl.update);
router.delete('/branches/:id', branchCtrl.delete);
router.get('/branches/:id/stats', branchCtrl.getStats);

// Foydalanuvchilar
router.get('/users', userCtrl.getAll);
router.post('/users', userCtrl.create);
router.get('/users/:id', userCtrl.getOne);
router.put('/users/:id', userCtrl.update);
router.patch('/users/:id/toggle', userCtrl.toggleActive);
router.patch('/users/:id/reset-password', userCtrl.resetPassword);

module.exports = router;
