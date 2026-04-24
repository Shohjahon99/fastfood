# 🍔 Fastfoot ERP Tizimi

## Ishga tushirish

### 1. Backend o'rnatish
```bash
cd backend
npm install
```

### 2. Database sozlash
`.env` faylini oching va MySQL ma'lumotlarini kiriting:
```
DB_HOST=localhost
DB_NAME=fastfoot_erp
DB_USER=root
DB_PASS=your_password
```

### 3. MySQL'da database yaratish
```sql
CREATE DATABASE fastfoot_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Seeder ishlatish (test ma'lumotlar)
```bash
cd backend
npm run seed
```

### 5. Backend ishga tushirish
```bash
cd backend
npm run dev
# http://localhost:5000
```

### 6. Frontend o'rnatish va ishga tushirish
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## 🔑 Login ma'lumotlari

| Rol | Email | Parol |
|-----|-------|-------|
| Super Admin | superadmin@fastfoot.uz | Admin@123456 |
| Director | director@fastfoot.uz | Director@123 |
| Cashier | cashier@fastfoot.uz | Cashier@123 |

## 📁 Tizim strukturasi

```
Fastfoot ERP/
├── backend/          # Express.js API
│   └── src/
│       ├── models/       # Sequelize modellari
│       ├── controllers/  # Biznes logikasi
│       ├── routes/       # API endpointlar
│       ├── middleware/   # Auth, ruxsat
│       └── seeders/      # Test ma'lumotlar
└── frontend/         # React + Vite
    └── src/
        ├── pages/
        │   ├── superadmin/   # Super Admin panel
        │   ├── admin/        # Director panel
        │   └── erp/          # ERP modullari
        ├── api/              # API so'rovlar
        ├── contexts/         # React Context
        └── components/       # Umumiy komponentlar
```
