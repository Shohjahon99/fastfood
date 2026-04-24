const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Faqat rasm fayllari qabul qilinadi (jpg, png, webp)'), false);
};

const productUpload = multer({
  storage: createStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

const avatarUpload = multer({
  storage: createStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { productUpload, avatarUpload };
