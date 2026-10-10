import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createVideoJob, listAvailableTemplates } from './services/ffmpegService.js';
import { getYoutubeChannelInfo } from './services/youtubeService.js';
import { getTikTokProfile } from './services/tiktokService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, '../data');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const jobsFile = path.join(DATA_DIR, 'jobs.json');
if (!fs.existsSync(jobsFile)) {
  fs.writeFileSync(jobsFile, JSON.stringify([], null, 2));
}

const readJobs = () => {
  const raw = fs.readFileSync(jobsFile, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeJobs = (jobs) => {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
};

const createJob = (payload) => {
  const job = {
    id: uuidv4(),
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload
  };

  const jobs = readJobs();
  jobs.unshift(job);
  writeJobs(jobs);
  return job;
};

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Harmes API',
    timestamp: new Date().toISOString(),
    ffmpegAvailable: !!process.env.FFMPEG_PATH
  });
});

app.get('/api/templates', (req, res) => {
  res.json({ templates: listAvailableTemplates() });
});

app.post('/api/jobs/create', async (req, res) => {
  try {
    const payload = req.body;
    const job = createJob({
      type: payload.type || 'video',
      prompt: payload.prompt || '',
      assets: payload.assets || [],
      channel: payload.channel || 'default',
      platform: payload.platform || 'youtube',
      outputName: payload.outputName || `render-${Date.now()}`,
      config: payload.config || {}
    });

    const generated = await createVideoJob({
      jobId: job.id,
      prompt: job.prompt,
      outputName: job.outputName,
      config: job.config,
      assets: job.assets
    });

    const jobs = readJobs();
    const index = jobs.findIndex((item) => item.id === job.id);
    if (index >= 0) {
      jobs[index] = {
        ...jobs[index],
        status: generated.status,
        statusMessage: generated.statusMessage,
        outputPath: generated.outputPath,
        updatedAt: new Date().toISOString()
      };
      writeJobs(jobs);
    }

    res.status(201).json({ job: jobs[index] || job });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create job',
      details: error.message
    });
  }
});

app.get('/api/jobs', (req, res) => {
  const jobs = readJobs();
  res.json({ jobs });
});

app.get('/api/jobs/:jobId', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find((item) => item.id === req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

app.post('/api/publish/youtube', async (req, res) => {
  try {
    const { videoPath, title, description } = req.body;
    const result = await getYoutubeChannelInfo({ videoPath, title, description });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to publish to YouTube',
      details: error.message
    });
  }
});

app.post('/api/publish/tiktok', async (req, res) => {
  try {
    const { videoPath, description } = req.body;
    const result = await getTikTokProfile({ videoPath, description });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to publish to TikTok',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Harmes API running on http://localhost:${PORT}`);
});
