require('dotenv').config();
const { sequelize, User, Branch, Category, Product } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database ulandi');
    await sequelize.sync({ alter: true });
    console.log('✅ Jadvallar tekshirildi');

    // Agar superadmin allaqachon mavjud bo'lsa — seed o'tkazib yuboriladi
    const existingAdmin = await User.findOne({ where: { role: 'superadmin' } });
    if (existingAdmin) {
      console.log('ℹ️  Ma\'lumotlar allaqachon mavjud, seed o\'tkazib yuborildi');
      console.log('📧 SuperAdmin:', existingAdmin.email);
      process.exit(0);
      return;
    }

    // Super Admin
    const superadmin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@fastfoot.uz',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123',
      role: 'superadmin',
      phone: '+998901234567',
    });
    console.log('✅ SuperAdmin yaratildi:', superadmin.email);

    // Director
    const director = await User.create({
      name: 'Abdullayev Jasur',
      email: 'director@fastfoot.uz',
      password: 'Director@123',
      role: 'director',
      phone: '+998901111111',
    });
    await director.update({ tenantId: director.id });

    // Filiallar
    const branch1 = await Branch.create({
      name: 'Fastfoot - Chilonzor', address: 'Chilonzor ko\'chasi 15',
      city: 'Toshkent', phone: '+998711234567',
      directorId: director.id, tenantId: director.id,
    });
    await Branch.create({
      name: 'Fastfoot - Yunusobod', address: 'Yunusobod 18-mavze',
      city: 'Toshkent', phone: '+998712345678',
      directorId: director.id, tenantId: director.id,
    });

    await director.update({ branchId: branch1.id });

    // Cashier
    await User.create({
      name: 'Karimov Bobur',
      email: 'cashier@fastfoot.uz',
      password: 'Cashier@123',
      role: 'cashier',
      branchId: branch1.id,
      tenantId: director.id,
      phone: '+998902222222',
    });
    console.log('✅ Foydalanuvchilar yaratildi');

    // Kategoriyalar
    const cats = await Category.bulkCreate([
      { name: 'Burgerlar', icon: '🍔', order: 1, tenantId: director.id },
      { name: 'Pittsalar',  icon: '🍕', order: 2, tenantId: director.id },
      { name: 'Ichimliklar',icon: '🥤', order: 3, tenantId: director.id },
      { name: 'Salatlar',   icon: '🥗', order: 4, tenantId: director.id },
      { name: 'Deserlar',   icon: '🍰', order: 5, tenantId: director.id },
    ]);
    console.log('✅ Kategoriyalar yaratildi');

    // Mahsulotlar
    await Product.bulkCreate([
      { name: 'Classic Burger',  price: 25000, costPrice: 12000, categoryId: cats[0].id, prepTime: 10, calories: 520, isActive: true, tenantId: director.id },
      { name: 'Double Burger',   price: 35000, costPrice: 17000, categoryId: cats[0].id, prepTime: 12, calories: 720, isActive: true, tenantId: director.id },
      { name: 'Chicken Burger',  price: 28000, costPrice: 13000, categoryId: cats[0].id, prepTime: 10, calories: 480, isActive: true, tenantId: director.id },
      { name: 'Margarita Pizza', price: 45000, costPrice: 20000, categoryId: cats[1].id, prepTime: 20, calories: 800, isActive: true, tenantId: director.id },
      { name: 'Pepperoni Pizza', price: 55000, costPrice: 25000, categoryId: cats[1].id, prepTime: 22, calories: 950, isActive: true, tenantId: director.id },
      { name: 'Coca-Cola 0.5L', price: 8000,  costPrice: 3000,  categoryId: cats[2].id, prepTime: 1,  calories: 180, isActive: true, tenantId: director.id },
      { name: 'Fresh Juice',    price: 15000, costPrice: 6000,  categoryId: cats[2].id, prepTime: 5,  calories: 120, isActive: true, tenantId: director.id },
      { name: 'Caesar Salad',   price: 22000, costPrice: 9000,  categoryId: cats[3].id, prepTime: 8,  calories: 320, isActive: true, tenantId: director.id },
      { name: 'Tiramisu',       price: 18000, costPrice: 7000,  categoryId: cats[4].id, prepTime: 2,  calories: 400, isActive: true, tenantId: director.id },
    ]);
    console.log('✅ Mahsulotlar yaratildi');

    console.log('\n🎉 Seeder muvaffaqiyatli bajarildi!\n');
    console.log('📧 SuperAdmin:', superadmin.email, '| 🔑 Admin@123');
    console.log('📧 Director:   director@fastfoot.uz | 🔑 Director@123');
    console.log('📧 Cashier:    cashier@fastfoot.uz  | 🔑 Cashier@123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
    process.exit(1);
  }
}

seed();
