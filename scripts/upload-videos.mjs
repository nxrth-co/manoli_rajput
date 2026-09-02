/**
 * Cloudinary Large Video Batch Upload Script
 * 
 * Specifically configured for uploading large video files (>140MB) using
 * chunked upload (cloudinary.uploader.upload_large) with resource_type: "video".
 */

import fs from 'node:fs';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

// 1. Target files specified for upload
const TARGET_FILES = [
  'edited1.mp4',
  'edited2.mp4',
  'edited3.mp4',
  'edited4.mp4',
  'edited5.mp4',
  'edited6.mp4',
  'raw1.mp4',
  'raw2.mp4',
  'raw3.mp4'
];

// 2. Parse CLOUDINARY_URL directly from .env file
function parseCloudinaryUrlFromEnv() {
  if (process.env.CLOUDINARY_URL) {
    return process.env.CLOUDINARY_URL;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`[ERROR] .env file not found at: ${envPath}`);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^\s*CLOUDINARY_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  
  if (!match || !match[1]) {
    throw new Error('[ERROR] CLOUDINARY_URL variable could not be parsed from .env file.');
  }

  const parsedUrl = match[1].trim();
  process.env.CLOUDINARY_URL = parsedUrl;
  return parsedUrl;
}

// 3. Configure Cloudinary SDK
function configureCloudinary() {
  const cloudinaryUrl = parseCloudinaryUrlFromEnv();
  
  try {
    const urlObj = new URL(cloudinaryUrl);
    const cloudName = urlObj.hostname;
    const apiKey = urlObj.username;
    const apiSecret = urlObj.password;

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    console.log(`[INIT] Cloudinary configured successfully for cloud: "${cloudName}"`);
    return cloudName;
  } catch (err) {
    // Fallback to automatic environment parsing by Cloudinary SDK
    cloudinary.config(true);
    console.log('[INIT] Cloudinary configured via SDK process.env.CLOUDINARY_URL parser.');
    return 'configured';
  }
}

// 4. Resolve local path for each target file
function resolveLocalFilePath(filename) {
  const possiblePaths = [
    path.join(process.cwd(), 'assets', 'videos', 'edited', filename),
    path.join(process.cwd(), 'assets', 'videos', 'raw', filename),
    path.join(process.cwd(), 'assets', 'videos', filename),
    path.join(process.cwd(), 'videos', filename),
    path.join(process.cwd(), filename)
  ];

  for (const candidate of possiblePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

// Format file size in megabytes
function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 5. Upload a single file using chunked upload_large
function uploadLargeVideo(filePath, publicId) {
  return new Promise((resolve, reject) => {
    const fileSize = fs.statSync(filePath).size;
    console.log(`[UPLOADING] ${path.basename(filePath)} (${formatMb(fileSize)})`);
    console.log(`            -> Chunk size: 20MB, public_id: "${publicId}"`);

    // upload_large is required for videos > 100MB (like edited1.mp4 at ~155MB)
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: 'video',
        public_id: publicId,
        chunk_size: 20 * 1024 * 1024, // 20MB chunks
        overwrite: true,
        eager_async: true,
        invalidate: true
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
}

// 6. Main execution flow
async function main() {
  console.log('====================================================');
  console.log(' Cloudinary Batch Large Video Uploader');
  console.log('====================================================\n');

  const cloudName = configureCloudinary();
  const outJsonPath = path.resolve(process.cwd(), 'cloudinary-videos.json');
  let results = {};
  if (fs.existsSync(outJsonPath)) {
    try {
      results = JSON.parse(fs.readFileSync(outJsonPath, 'utf8'));
    } catch {}
  }
  const notFound = [];
  const errors = [];
  const force = process.argv.includes('--force');

  for (const filename of TARGET_FILES) {
    const baseName = path.parse(filename).name;

    // Skip if already successfully uploaded (unless --force is passed)
    if (results[baseName]?.secure_url && !force) {
      console.log(`[SKIP] ${filename} already uploaded: ${results[baseName].secure_url}`);
      continue;
    }

    const localPath = resolveLocalFilePath(filename);

    if (!localPath) {
      console.warn(`[WARN] File not found: ${filename}`);
      notFound.push(filename);
      continue;
    }

    const baseName = path.parse(filename).name;
    const folder = filename.startsWith('edited') ? 'portfolio/edited' : 'portfolio/raw';
    const targetPublicId = `${folder}/${baseName}`;

    try {
      const startTime = Date.now();
      const res = await uploadLargeVideo(localPath, targetPublicId);
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`[SUCCESS] Uploaded ${filename} in ${elapsedSec}s:`);
      console.log(`          public_id:  ${res.public_id}`);
      console.log(`          secure_url: ${res.secure_url}`);
      console.log(`          duration:   ${res.duration || 'N/A'}s`);
      console.log(`          format:     ${res.format}`);
      console.log(`----------------------------------------------------`);

      results[baseName] = {
        filename,
        public_id: res.public_id,
        secure_url: res.secure_url,
        duration: res.duration,
        format: res.format,
        bytes: res.bytes,
        width: res.width,
        height: res.height
      };
    } catch (uploadError) {
      console.error(`[ERROR] Failed uploading ${filename}:`, uploadError.message || uploadError);
      errors.push({ filename, error: uploadError.message || uploadError });
    }
  }

  // Summary log
  console.log('\n====================================================');
  console.log(' BATCH UPLOAD SUMMARY');
  console.log('====================================================');
  console.log(`Successful: ${Object.keys(results).length}/${TARGET_FILES.length}`);
  if (notFound.length > 0) console.log(`Missing:    ${notFound.join(', ')}`);
  if (errors.length > 0) console.log(`Failed:     ${errors.map(e => e.filename).join(', ')}`);

  console.log('\n--- MAPPING FOR NEXT.JS UI ---');
  console.log(JSON.stringify(results, null, 2));

  // Save mapping to JSON file for easy import into Next.js components
  const outJsonPath = path.resolve(process.cwd(), 'cloudinary-videos.json');
  fs.writeFileSync(outJsonPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n[OUTPUT] Saved mappings to: ${outJsonPath}`);
  console.log(`[NEXT STEP] Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName} in .env.local`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
