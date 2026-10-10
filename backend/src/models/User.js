import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class User {
  static async create(userData) {
    const db = getDatabase();
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    try {
      const stmt = db.prepare(`
        INSERT INTO users (
          id, email, password, username, fullName, profileImage, bio, preferences
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        userData.email,
        hashedPassword,
        userData.username,
        userData.fullName || null,
        userData.profileImage || null,
        userData.bio || null,
        JSON.stringify(userData.preferences || {})
      );
      
      return this.findById(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email or username already exists');
      }
      throw error;
    }
  }

  static findById(id) {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (user) {
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    return user;
  }

  static findByEmail(email) {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (user) {
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    return user;
  }

  static findByUsername(username) {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (user) {
      user.preferences = JSON.parse(user.preferences || '{}');
    }
    return user;
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static update(id, userData) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(userData)) {
      if (key !== 'id' && key !== 'password') {
        fields.push(`${key} = ?`);
        if (key === 'preferences') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return this.findById(id);
  }

  static updateSubscription(userId, plan, expiryDate) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE users 
      SET subscriptionPlan = ?, subscriptionExpiry = ?, updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(plan, expiryDate, new Date().toISOString(), userId);
    return this.findById(userId);
  }

  static updateVideoStats(userId, videosGenerated = 0, videosPublished = 0) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE users 
      SET totalVideosGenerated = totalVideosGenerated + ?,
          totalVideosPublished = totalVideosPublished + ?,
          updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(videosGenerated, videosPublished, new Date().toISOString(), userId);
    return this.findById(userId);
  }

  static updateLastLogin(userId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE users 
      SET lastLogin = ?
      WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), userId);
  }

  static list(limit = 50, offset = 0) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all(limit, offset);
  }

  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
    return true;
  }

  static getStats(userId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        u.totalVideosGenerated,
        u.totalVideosPublished,
        COUNT(DISTINCT c.id) as totalCampaigns,
        COUNT(DISTINCT ch.id) as totalChannels,
        (SELECT COUNT(*) FROM videos WHERE userId = ?) as totalVideos
      FROM users u
      LEFT JOIN campaigns c ON u.id = c.userId
      LEFT JOIN channels ch ON u.id = ch.userId
      WHERE u.id = ?
    `).get(userId, userId);
  }
}
