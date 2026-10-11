// scripts/motion_reel_generator.mjs
// Converts Static Product/Festival Images into High-Definition Motion Reels with Thematic Audio
// Optimized for Instagram Reels, Facebook Reels/Video, and YouTube Shorts (1080x1920 / 9:16)

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'assets', 'audio');

// Locate FFmpeg binary (System PATH, Winget, or Local Bin)
export function getFfmpegPath() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch (e) {
    // Check common Windows WinGet locations
    const localAppData = process.env.LOCALAPPDATA || '';
    if (localAppData) {
      const wingetDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetDir)) {
        const findInDir = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory() && ent.name.toLowerCase().includes('ffmpeg')) {
              const binFfmpeg = path.join(full, 'bin', 'ffmpeg.exe');
              if (fs.existsSync(binFfmpeg)) return binFfmpeg;
              // subfolder check
              const subEntries = fs.readdirSync(full, { withFileTypes: true });
              for (const sub of subEntries) {
                if (sub.isDirectory()) {
                  const candidate = path.join(full, sub.name, 'bin', 'ffmpeg.exe');
                  if (fs.existsSync(candidate)) return candidate;
                }
              }
            }
          }
          return null;
        };
        const found = findInDir(wingetDir);
        if (found) return found;
      }
    }

    const localBin = path.join(__dirname, 'bin', 'ffmpeg.exe');
    if (fs.existsSync(localBin)) return localBin;

    return 'ffmpeg'; // Default fallback (e.g. Ubuntu GitHub Actions runner)
  }
}

// Select matching audio track based on filename and caption keywords
export function selectAudioTheme(fileName, caption = '') {
  const text = (fileName + ' ' + caption).toLowerCase();

  if (text.includes('navaratri') || text.includes('navratri') || text.includes('नवरात्र') || text.includes('garba') || text.includes('dandiya')) {
    return {
      theme: 'Navratri Festive',
      file: path.join(audioDir, 'navratri_ambient.wav')
    };
  }

  if (text.includes('diwali') || text.includes('दिवाळी') || text.includes('deepavali')) {
    return {
      theme: 'Diwali Festive',
      file: path.join(audioDir, 'diwali_ambient.wav')
    };
  }

  if (text.includes('moringa') || text.includes('शेवगा') || text.includes('amla') || text.includes('triphala') || text.includes('spirulina') || text.includes('superfood')) {
    return {
      theme: 'Ayurveda & Superfood Zen',
      file: path.join(audioDir, 'ayurveda_zen.wav')
    };
  }

  if (text.includes('soap') || text.includes('cream') || text.includes('glow') || text.includes('skin') || text.includes('kumkumadi') || text.includes('beauty')) {
    return {
      theme: 'Luxury Beauty & Skincare',
      file: path.join(audioDir, 'luxury_beauty.wav')
    };
  }

  return {
    theme: 'Wellness Acoustic',
    file: path.join(audioDir, 'wellness_acoustic.wav')
  };
}

// Convert Static Image + Audio Track -> 1080x1920 Luxury Motion Reel (MP4)
export async function createMotionReel(imagePath, audioPath, outputPath, durationSec = 12) {
  const ffmpegCmd = getFfmpegPath();
  console.log(`🎬 Rendering Motion Reel with FFmpeg (${ffmpegCmd})...`);
  console.log(`🖼️ Input Image: ${imagePath}`);
  console.log(`🎵 Audio Track: ${audioPath}`);
  console.log(`⏱️ Duration: ${durationSec}s -> Output: ${outputPath}`);

  // FFmpeg filter:
  // 1. [bg] Blurred luxury background scaled to fill 1080x1920
  // 2. [fg] Crisp foreground image centered with subtle Ken-Burns zoom
  // 3. Audio with smooth fade-in and fade-out
  const filterGraph = [
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg]`,
    `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black@0[fg]`,
    `[bg][fg]overlay=0:0[v]`
  ].join(';');

  const args = [
    '-y',
    '-loop', '1',
    '-i', imagePath,
    '-i', audioPath,
    '-filter_complex', filterGraph,
    '-map', '[v]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-r', '30',
    '-t', durationSec.toString(),
    outputPath
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegCmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        console.log(`✅ Motion Reel rendered successfully: ${outputPath} (${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB)`);
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg failed with code ${code}:\n${stderr.slice(-600)}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}
