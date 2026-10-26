const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch').default;

class VisualRegressionHelper {
  constructor() {
    // Menentukan direktori utama untuk menyimpan 3 jenis folder visual testing
    this.baselineDir = path.join(process.cwd(), 'visual-baseline'); // Gambar acuan utama
    this.currentDir = path.join(process.cwd(), 'visual-current');     // Screenshot hasil test terbaru
    this.diffDir = path.join(process.cwd(), 'visual-diff');           // Gambar perbandingan (selisih pixel)
    this._ensureDirs();
  }

  // Fungsi privat untuk memastikan folder-folder di atas otomatis terbuat jika belum ada
  _ensureDirs() {
    [this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getBaselinePath(filename) {
    return path.join(this.baselineDir, filename);
  }

  getCurrentPath(filename) {
    return path.join(this.currentDir, filename);
  }

  getDiffPath(filename) {
    return path.join(this.diffDir, filename);
  }

  // Mengecek apakah file gambar baseline sudah ada atau belum
  hasBaseline(filename) {
    return fs.existsSync(this.getBaselinePath(filename));
  }

  // Menyalin screenshot aktual ke dalam folder visual-current
  saveCurrentScreenshot(sourcePath, filename) {
    const currentPath = this.getCurrentPath(filename);
    fs.copyFileSync(sourcePath, currentPath);
  }

  // Menyimpan screenshot current menjadi baseline pertama jika belum ada file acuan
  saveAsBaseline(currentFilename, baselineFilename = currentFilename) {
    const currentPath = this.getCurrentPath(currentFilename);
    const baselinePath = this.getBaselinePath(baselineFilename);

    if (fs.existsSync(currentPath)) {
      fs.copyFileSync(currentPath, baselinePath);
    }
  }

  // Fungsi utama untuk membandingkan gambar baseline dengan gambar current
  async compareImages(filename) {
    const baselinePath = this.getBaselinePath(filename);
    const currentPath = this.getCurrentPath(filename);
    const diffPath = this.getDiffPath(filename);

    // Validasi jika file baseline belum tersedia
    if (!fs.existsSync(baselinePath)) {
      return { hasBaseline: false, match: null, matchPercentage: 0, message: `No baseline found for ${filename}` };
    }

    // Validasi jika file screenshot current tidak ditemukan
    if (!fs.existsSync(currentPath)) {
      return { hasBaseline: true, match: false, matchPercentage: 0, message: `Current screenshot not found: ${filename}` };
    }

    try {
      // Memuat gambar baseline dan current menggunakan canvas
      const baselineImage = await loadImage(baselinePath);
      const currentImage = await loadImage(currentPath);

      const width = baselineImage.width;
      const height = baselineImage.height;

      // Mengecek apakah resolusi/dimensi gambar sama atau berbeda
      if (currentImage.width !== width || currentImage.height !== height) {
        return {
          hasBaseline: true,
          match: false,
          matchPercentage: 0,
          message: `Image dimensions differ: baseline ${width}x${height} vs current ${currentImage.width}x${currentImage.height}`
        };
      }

      const canvasBaseline = createCanvas(width, height);
      const canvasCurrent = createCanvas(width, height);
      const canvasDiff = createCanvas(width, height);

      const ctxBaseline = canvasBaseline.getContext('2d');
      const ctxCurrent = canvasCurrent.getContext('2d');
      const ctxDiff = canvasDiff.getContext('2d');

      // Mengisi background canvas diff dengan warna putih
      ctxDiff.fillStyle = '#ffffff';
      ctxDiff.fillRect(0, 0, width, height);

      ctxBaseline.drawImage(baselineImage, 0, 0);
      ctxCurrent.drawImage(currentImage, 0, 0);

      const imageDataBaseline = ctxBaseline.getImageData(0, 0, width, height);
      const imageDataCurrent = ctxCurrent.getImageData(0, 0, width, height);
      const imageDataDiff = ctxDiff.getImageData(0, 0, width, height);

      // Menjalankan pixelmatch untuk mendeteksi perbedaan pixel (dengan highlight warna merah)
      const numDiffPixels = pixelmatch(
        imageDataBaseline.data,
        imageDataCurrent.data,
        imageDataDiff.data,
        width,
        height,
        { threshold: 0.1, diffColor: [255, 0, 0] }
      );

      ctxDiff.putImageData(imageDataDiff, 0, 0);

      // Menyimpan hasil gambar perbedaan ke dalam folder visual-diff
      const diffBuffer = canvasDiff.toBuffer('image/png');
      fs.writeFileSync(diffPath, diffBuffer);

      // Menghitung persentase kemiripan gambar
      const totalPixels = width * height;
      const matchPercentage = ((totalPixels - numDiffPixels) / totalPixels) * 100;

      return {
        hasBaseline: true,
        match: matchPercentage >= 95, // Menyatakan lulus jika kemiripan minimal 95%
        matchPercentage: parseFloat(matchPercentage.toFixed(2)),
        diffPath: diffPath,
        message: numDiffPixels === 0 ? 'Images are identical' : `Found ${numDiffPixels} different pixels`
      };
    } catch (error) {
      console.error(`Visual Regression Error: ${error.message}`);
      return {
        hasBaseline: true,
        match: false,
        matchPercentage: 0,
        message: `Error comparing images: ${error.message}`
      };
    }
  }
}

module.exports = VisualRegressionHelper;