const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const { productUpload } = require('../../middleware/upload');
const orderCtrl = require('../../controllers/erp/orderController');
const productCtrl = require('../../controllers/erp/productController');
const inventoryCtrl = require('../../controllers/erp/inventoryController');
const expenseCtrl = require('../../controllers/erp/expenseController');
const customerCtrl = require('../../controllers/erp/customerController');
const reportCtrl = require('../../controllers/erp/reportController');

const all = ['superadmin', 'director', 'manager', 'cashier', 'waiter', 'cook', 'courier'];
const mgmt = ['superadmin', 'director', 'manager'];

router.use(authenticate);

// Orders
router.get('/orders', authorize(...all), orderCtrl.getAll);
router.post('/orders', authorize(...all), orderCtrl.create);
router.get('/orders/:id', authorize(...all), orderCtrl.getOne);
router.patch('/orders/:id/status', authorize(...all), orderCtrl.updateStatus);

// Products (rasm bilan)
router.get('/products', authorize(...all), productCtrl.getAll);
router.post('/products', authorize(...mgmt), productUpload.single('image'), productCtrl.create);
router.put('/products/:id', authorize(...mgmt), productUpload.single('image'), productCtrl.update);
router.delete('/products/:id', authorize(...mgmt), productCtrl.delete);

// Categories
router.get('/categories', authorize(...all), productCtrl.getCategories);
router.post('/categories', authorize(...mgmt), productCtrl.createCategory);

// Inventory
router.get('/inventory', authorize(...mgmt), inventoryCtrl.getAll);
router.post('/inventory', authorize(...mgmt), inventoryCtrl.create);
router.put('/inventory/:id', authorize(...mgmt), inventoryCtrl.update);
router.patch('/inventory/:id/stock', authorize(...mgmt), inventoryCtrl.addStock);

// Expenses
router.get('/expenses', authorize(...mgmt), expenseCtrl.getAll);
router.post('/expenses', authorize(...mgmt), expenseCtrl.create);
router.put('/expenses/:id', authorize(...mgmt), expenseCtrl.update);
router.delete('/expenses/:id', authorize('superadmin', 'director'), expenseCtrl.delete);

// Customers
router.get('/customers', authorize(...all), customerCtrl.getAll);
router.post('/customers', authorize(...all), customerCtrl.create);
router.get('/customers/phone/:phone', authorize(...all), customerCtrl.findByPhone);
router.get('/customers/:id', authorize(...all), customerCtrl.getOne);

// Reports
router.get('/reports/sales', authorize(...mgmt), reportCtrl.getSalesReport);
router.get('/reports/profit', authorize(...mgmt), reportCtrl.getProfitReport);
router.get('/reports/branches', authorize('superadmin', 'director'), reportCtrl.getBranchComparison);

module.exports = router;
