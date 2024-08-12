const multer = require('multer');
const path = require('path');

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Yüklenen dosyaların kaydedileceği klasör
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Dosya adı formatı: tarih-saat-orijinalDosyaAdı
  }
});

const fileFilter = (req, file, cb) => {
  // Dosya türü kontrolü örneği: Sadece belirli türde dosyaların kabul edilmesi
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Kabul edilen dosya
  } else {
    cb(new Error('Desteklenmeyen dosya türü! Sadece JPEG ve PNG dosyaları kabul edilir.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;