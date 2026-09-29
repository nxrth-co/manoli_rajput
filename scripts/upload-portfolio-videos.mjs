import fs from 'node:fs';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

// Target categories and exact file sequences
const PORTFOLIO_VIDEOS = {
  Moments: [
    '1 line 1.mp4',
    '1 line 2.mp4',
    '1 line 3.mp4',
    '2 line 1.MP4',
    '2 line 2.MOV',
    '2 line 3.mp4'
  ],
  Mindful: [
    '1 line 1.MOV',
    '1 line 2.MP4',
    '1 line 3.MP4',
    '2 line 1.MOV',
    '2 line 2.MP4',
    '2 line 3.MP4'
  ],
  Making: [
    'IMG_0708.mov',
    'IMG_0863.mov',
    'IMG_1039.mov',
    'IMG_1884.mov',
    'IMG_7917.MOV',
    'IMG_8021.mov'
  ]
};

// Parse CLOUDINARY_URL from .env
function configureCloudinary() {
  let envUrl = process.env.CLOUDINARY_URL;

  if (!envUrl) {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^\s*CLOUDINARY_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match) {
        envUrl = match[1].trim();
      }
    }
  }

  if (!envUrl) {
    throw new Error('CLOUDINARY_URL could not be found in environment or .env file');
  }

  const urlObj = new URL(envUrl);
  cloudinary.config({
    cloud_name: urlObj.hostname,
    api_key: urlObj.username,
    api_secret: urlObj.password,
    secure: true
  });

  console.log(`[INIT] Cloudinary configured for cloud: ${urlObj.hostname}`);
  return urlObj.hostname;
}

function sanitizeForPublicId(filename) {
  const parsed = path.parse(filename);
  const cleanName = parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return cleanName;
}

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getOptimizedUrl(secureUrl) {
  // Add f_auto,q_auto and force .mp4 extension for universal browser playback
  return secureUrl
    .replace('/video/upload/', '/video/upload/f_auto,q_auto/')
    .replace(/\.[a-zA-Z0-9]+$/, '.mp4');
}

function uploadLargeVideo(filePath, publicId) {
  return new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    console.log(`[UPLOADING] ${path.basename(filePath)} (${formatBytes(fileSize)})`);
    console.log(`            -> public_id: "${publicId}"`);

    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: 'video',
        public_id: publicId,
        chunk_size: 20 * 1024 * 1024,
        overwrite: true,
        invalidate: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}

async function main() {
  console.log('====================================================');
  console.log(' Cloudinary Portfolio Video Upload Pipeline');
  console.log('====================================================\n');

  configureCloudinary();

  const outJsonPath = path.resolve(process.cwd(), 'cloudinary-videos.json');
  const srcJsonPath = path.resolve(process.cwd(), 'src', 'data', 'cloudinary-videos.json');

  let results = {
    Moments: [],
    Mindful: [],
    Making: []
  };

  if (fs.existsSync(outJsonPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outJsonPath, 'utf8'));
      if (existing.Moments && existing.Mindful && existing.Making) {
        results = existing;
      }
    } catch {}
  }

  const force = process.argv.includes('--force');

  for (const [category, filenames] of Object.entries(PORTFOLIO_VIDEOS)) {
    console.log(`\n>>> Processing category: ${category} (${filenames.length} videos)`);

    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      const number = String(index + 1).padStart(2, '0');
      const safeName = sanitizeForPublicId(filename);
      const publicId = `portfolio/${category.toLowerCase()}/${number}_${safeName}`;

      // Check if already uploaded
      const existingEntry = results[category]?.find(item => item.filename === filename && item.secure_url);
      if (existingEntry && !force) {
        console.log(`[SKIP] [${category} ${number}] ${filename} already uploaded: ${existingEntry.secure_url}`);
        continue;
      }

      const localPath = path.resolve(process.cwd(), 'public', 'videos', category, filename);
      if (!fs.existsSync(localPath)) {
        console.error(`[ERROR] File not found: ${localPath}`);
        continue;
      }

      const startTime = Date.now();
      try {
        const res = await uploadLargeVideo(localPath, publicId);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const optimizedUrl = getOptimizedUrl(res.secure_url);

        console.log(`[SUCCESS] [${category} ${number}] Uploaded in ${elapsed}s`);
        console.log(`          Secure URL:    ${res.secure_url}`);
        console.log(`          Optimized URL: ${optimizedUrl}`);

        const videoRecord = {
          category,
          index,
          id: `${category.toLowerCase()}-${number}`,
          title: `${category} ${number}`,
          letter: number,
          subtitle: `${category} ${number}`,
          filename,
          public_id: res.public_id,
          secure_url: res.secure_url,
          videoUrl: optimizedUrl,
          duration: res.duration || null,
          format: res.format,
          bytes: res.bytes,
          width: res.width,
          height: res.height
        };

        // Update results array maintaining exact position
        if (!results[category]) results[category] = [];
        const existingIdx = results[category].findIndex(item => item.filename === filename);
        if (existingIdx >= 0) {
          results[category][existingIdx] = videoRecord;
        } else {
          results[category].push(videoRecord);
        }

        // Keep sorted by index
        results[category].sort((a, b) => a.index - b.index);

        // Save progress immediately
        fs.writeFileSync(outJsonPath, JSON.stringify(results, null, 2), 'utf8');
        fs.writeFileSync(srcJsonPath, JSON.stringify(results, null, 2), 'utf8');
      } catch (err) {
        console.error(`[FAIL] Upload failed for ${filename}:`, err.message || err);
      }
    }
  }

  console.log('\n====================================================');
  console.log(' UPLOAD PIPELINE COMPLETE');
  console.log('====================================================');
  console.log(`Moments: ${results.Moments?.length || 0}/6`);
  console.log(`Mindful: ${results.Mindful?.length || 0}/6`);
  console.log(`Making:  ${results.Making?.length || 0}/6`);
  console.log(`\nSaved video registry to:\n  - ${outJsonPath}\n  - ${srcJsonPath}`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
