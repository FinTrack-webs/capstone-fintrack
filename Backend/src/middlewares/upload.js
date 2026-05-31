const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tentukan direktori penyimpanan uploads
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');

// Buat direktori secara otomatis jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate nama file unik: avatar-userId-timestamp.ext
    const userId = req.user?.userId || 'anonymous';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${uniqueSuffix}${fileExt}`);
  },
});

// Filter Tipe File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya diperbolehkan format JPEG, JPG, PNG, atau WEBP.'));
  }
};

// Inisialisasi Multer Middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Maksimal 2MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
