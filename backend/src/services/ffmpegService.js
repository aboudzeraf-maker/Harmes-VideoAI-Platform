import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const templates = [
  {
    id: 'reel-vertical',
    name: 'Vertical Reel',
    dimensions: '1080x1920',
    duration: 15,
    note: 'ملف فيديو عمودي مناسب لـ TikTok و Reels'
  },
  {
    id: 'youtube-16x9',
    name: 'YouTube 16:9',
    dimensions: '1920x1080',
    duration: 30,
    note: 'ملف فيديو واسع مناسب لـ YouTube'
  }
];

export const listAvailableTemplates = () => templates;

export const createVideoJob = async ({ jobId, prompt, outputName, config, assets }) => {
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${outputName || jobId}.mp4`);
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

  try {
    const args = [
      '-f', 'lavfi',
      '-i', 'color=c=0x121212:s=1280x720:d=3',
      '-vf', `drawtext=text='${(prompt || 'Harmes AI Video').replace(/'/g, "\\'") }':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-t', String(config.duration || 6),
      '-y',
      outputPath
    ];

    await execFileAsync(ffmpegPath, args, { maxBuffer: 1024 * 1024 * 50 });

    return {
      status: 'completed',
      statusMessage: 'Video generated successfully',
      outputPath,
      jobId
    };
  } catch (error) {
    return {
      status: 'failed',
      statusMessage: error.message || 'FFmpeg generation failed',
      outputPath: null,
      jobId
    };
  }
};
