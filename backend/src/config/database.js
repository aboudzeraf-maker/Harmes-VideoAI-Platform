import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/harmes.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

export const initDatabase = () => {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Create all tables
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      fullName TEXT,
      profileImage TEXT,
      bio TEXT,
      subscriptionPlan TEXT DEFAULT 'free',
      subscriptionExpiry DATETIME,
      totalVideosGenerated INTEGER DEFAULT 0,
      totalVideosPublished INTEGER DEFAULT 0,
      preferences TEXT,
      isActive BOOLEAN DEFAULT 1,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Channels Table
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      platform TEXT NOT NULL,
      name TEXT NOT NULL,
      channelId TEXT UNIQUE,
      accessToken TEXT,
      refreshToken TEXT,
      tokenExpiry DATETIME,
      profileImage TEXT,
      subscribers INTEGER DEFAULT 0,
      isActive BOOLEAN DEFAULT 1,
      lastSyncedAt DATETIME,
      metadata TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Campaigns Table
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      targetAudience TEXT,
      toneOfVoice TEXT,
      videoDuration INTEGER DEFAULT 15,
      quality TEXT DEFAULT '1080p',
      fps INTEGER DEFAULT 30,
      format TEXT DEFAULT 'mp4',
      platforms TEXT,
      tags TEXT,
      status TEXT DEFAULT 'draft',
      totalBudget REAL,
      spentBudget REAL DEFAULT 0,
      scheduledPublish BOOLEAN DEFAULT 0,
      publishStartDate DATETIME,
      publishEndDate DATETIME,
      videoCount INTEGER DEFAULT 0,
      generatedCount INTEGER DEFAULT 0,
      publishedCount INTEGER DEFAULT 0,
      metadata TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Videos Table
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      campaignId TEXT,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      prompt TEXT,
      thumbnailText TEXT,
      backgroundMusic TEXT,
      voiceOverScript TEXT,
      voiceOverAudio TEXT,
      status TEXT DEFAULT 'pending',
      quality TEXT DEFAULT '1080p',
      duration INTEGER DEFAULT 15,
      fps INTEGER DEFAULT 30,
      format TEXT DEFAULT 'mp4',
      filePath TEXT,
      fileSize INTEGER,
      thumbnail TEXT,
      previewUrl TEXT,
      aiGenerated BOOLEAN DEFAULT 1,
      generationType TEXT,
      generationModel TEXT,
      generationTime INTEGER,
      processingStartedAt DATETIME,
      processedAt DATETIME,
      metadata TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaignId) REFERENCES campaigns(id) ON DELETE SET NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Publishing Schedule Table
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      userId TEXT NOT NULL,
      title TEXT,
      description TEXT,
      hashtags TEXT,
      scheduledTime DATETIME,
      timeZone TEXT DEFAULT 'UTC',
      status TEXT DEFAULT 'scheduled',
      publishedAt DATETIME,
      publishedUrl TEXT,
      retries INTEGER DEFAULT 0,
      maxRetries INTEGER DEFAULT 5,
      lastError TEXT,
      lastErrorAt DATETIME,
      platform TEXT,
      metadata TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(videoId) REFERENCES videos(id) ON DELETE CASCADE,
      FOREIGN KEY(channelId) REFERENCES channels(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Analytics Table
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      videoId TEXT NOT NULL,
      platform TEXT NOT NULL,
      platformVideoId TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      clickThroughs INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      engagement REAL DEFAULT 0,
      avgWatchTime REAL DEFAULT 0,
      completionRate REAL DEFAULT 0,
      trafficSources TEXT,
      demographics TEXT,
      lastUpdatedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(videoId) REFERENCES videos(id) ON DELETE CASCADE
    );

    -- Templates Table
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      dimensions TEXT,
      duration INTEGER,
      fps INTEGER,
      aspectRatio TEXT,
      structure TEXT,
      effects TEXT,
      musicType TEXT,
      transitionType TEXT,
      fontFamily TEXT,
      colorScheme TEXT,
      isPublic BOOLEAN DEFAULT 0,
      usageCount INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      previewImage TEXT,
      templateData TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Assets Library Table
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      filePath TEXT,
      fileName TEXT,
      fileSize INTEGER,
      mimeType TEXT,
      duration INTEGER,
      width INTEGER,
      height INTEGER,
      dimensions TEXT,
      tags TEXT,
      category TEXT,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Jobs Queue Table
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      videoId TEXT,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'queued',
      priority INTEGER DEFAULT 0,
      payload TEXT,
      result TEXT,
      errorMessage TEXT,
      errorStack TEXT,
      retries INTEGER DEFAULT 0,
      maxRetries INTEGER DEFAULT 3,
      progress INTEGER DEFAULT 0,
      startedAt DATETIME,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(videoId) REFERENCES videos(id) ON DELETE CASCADE
    );

    -- API Keys Table
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      secret TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      lastUsedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Activity Log Table
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      entityType TEXT,
      entityId TEXT,
      details TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create Indexes for Performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_channels_userId ON channels(userId);
    CREATE INDEX IF NOT EXISTS idx_channels_platform ON channels(platform);
    CREATE INDEX IF NOT EXISTS idx_campaigns_userId ON campaigns(userId);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_videos_userId ON videos(userId);
    CREATE INDEX IF NOT EXISTS idx_videos_campaignId ON videos(campaignId);
    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
    CREATE INDEX IF NOT EXISTS idx_videos_createdAt ON videos(createdAt);
    CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
    CREATE INDEX IF NOT EXISTS idx_schedules_scheduledTime ON schedules(scheduledTime);
    CREATE INDEX IF NOT EXISTS idx_schedules_userId ON schedules(userId);
    CREATE INDEX IF NOT EXISTS idx_analytics_videoId ON analytics(videoId);
    CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics(platform);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_userId ON jobs(userId);
    CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
    CREATE INDEX IF NOT EXISTS idx_activity_userId ON activity_logs(userId);
    CREATE INDEX IF NOT EXISTS idx_activity_createdAt ON activity_logs(createdAt);
  `);

  console.log('✅ Database initialized successfully');
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};

export default db;
