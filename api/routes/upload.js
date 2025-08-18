const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    throw new Error(`无法创建上传目录: ${dirPath}, ${err.message}`);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || '/tmp/uploads';
    try { ensureDirectoryExists(uploadPath); cb(null, uploadPath); } catch (err) { cb(err); }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `construction_${Date.now()}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg','image/jpg','image/png','image/bmp','image/webp'];
  allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('不支持的文件格式，请上传 JPG、PNG、BMP 或 WebP 格式的图片'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, files: 1 }
});

async function processImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width < 480 || metadata.height < 360) throw new Error('图片分辨率过低，建议不低于480x360');
    if (metadata.width > 2048 || metadata.height > 2048) {
      const outputPath = filePath.replace(/(\.[^.]+)$/, '_compressed$1');
      await sharp(filePath).resize(2048, 2048, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(outputPath);
      fs.unlinkSync(filePath); fs.renameSync(outputPath, filePath);
    }
    return { width: metadata.width, height: metadata.height, format: metadata.format, size: metadata.size };
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
}

router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: '请选择要上传的图片文件' });
    const filePath = req.file.path;
    const imageInfo = await processImage(filePath);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, message: '图片上传成功', data: { filename: req.file.filename, originalName: req.file.originalname, url: fileUrl, path: filePath, size: req.file.size, imageInfo, uploadTime: new Date().toISOString() } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: error.message || '图片上传处理失败' });
  }
});

router.post('/base64', async (req, res) => {
  try {
    const { imageData, filename } = req.body;
    if (!imageData) return res.status(400).json({ success: false, message: '请提供图片数据' });
    const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ success: false, message: '无效的Base64图片数据' });
    const imageType = matches[1];
    const base64Data = matches[2];
    const allowedTypes = ['jpeg','jpg','png','bmp','webp'];
    if (!allowedTypes.includes(imageType.toLowerCase())) return res.status(400).json({ success: false, message: '不支持的图片格式' });
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExtension = imageType === 'jpeg' ? 'jpg' : imageType;
    const fileName = filename ? `${path.parse(filename).name}_${uniqueSuffix}.${fileExtension}` : `construction_${Date.now()}_${uniqueSuffix}.${fileExtension}`;
    const uploadPath = process.env.UPLOAD_PATH || '/tmp/uploads';
    ensureDirectoryExists(uploadPath);
    const filePath = path.join(uploadPath, fileName);
    const buffer = Buffer.from(base64Data, 'base64');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024;
    if (buffer.length > maxSize) return res.status(400).json({ success: false, message: `文件大小超过限制 (${Math.round(maxSize/1024/1024)}MB)` });
    fs.writeFileSync(filePath, buffer);
    const imageInfo = await processImage(filePath);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    res.json({ success: true, message: '图片上传成功', data: { filename: fileName, originalName: filename || fileName, url: fileUrl, path: filePath, size: buffer.length, imageInfo, uploadTime: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Base64图片上传失败' });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: '文件大小超过限制，最大支持20MB' });
    if (error.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ success: false, message: '一次只能上传一个文件' });
  }
  res.status(400).json({ success: false, message: error.message || '文件上传失败' });
});

module.exports = router;
