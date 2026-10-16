import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { roleSchema } from '../src/controllers/roleController.js';
import { videoSchema } from '../src/controllers/videoController.js';
import { registerSchema } from '../src/controllers/authController.js';
import { slugify } from '../src/utils/slugify.js';
import { extractYouTubeId } from '../src/utils/youtube.js';

describe('YouTube URL Utility Tests', () => {
  it('should extract ID from standard watch URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  it('should extract ID from youtu.be short URL', () => {
    const id = extractYouTubeId('https://youtu.be/dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  it('should extract ID from YouTube Shorts URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  it('should reject non-YouTube domains (phishing or arbitrary sites)', () => {
    const id = extractYouTubeId('https://vimeo.com/12345678901');
    assert.equal(id, null);

    const id2 = extractYouTubeId('https://fakeyoutube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(id2, null);
  });

  it('should reject invalid or malformed video IDs', () => {
    const id = extractYouTubeId('https://www.youtube.com/watch?v=tooshort');
    assert.equal(id, null);
  });
});

describe('Slugify Utility Tests', () => {
  it('should convert titles into clean URL-friendly slugs', () => {
    assert.equal(slugify('Belajar JavaScript Dasar 2026!'), 'belajar-javascript-dasar-2026');
    assert.equal(slugify('Tips & Tricks: Menembus Cyber Security'), 'tips-tricks-menembus-cyber-security');
    assert.equal(slugify('  Kategori Khusus   '), 'kategori-khusus');
  });
});

describe('Zod Validation Schemas Tests', () => {
  it('should accept valid user registration payload', () => {
    const valid = {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const res = registerSchema.safeParse(valid);
    assert.equal(res.success, true);
  });

  it('should reject registration when passwords do not match', () => {
    const mismatch = {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
    };
    const res = registerSchema.safeParse(mismatch);
    assert.equal(res.success, false);
  });

  it('should reject registration with invalid email or short password', () => {
    const invalid = {
      name: 'B',
      email: 'not-an-email',
      password: '123',
      confirmPassword: '123',
    };
    const res = registerSchema.safeParse(invalid);
    assert.equal(res.success, false);
  });

  it('should validate video creation schema', () => {
    const validVideo = {
      title: 'Tutorial Python Lengkap',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Panduan belajar python dari pemula sampai mahir.',
      categoryId: 'cat-uuid-123',
      status: 'PUBLISHED',
      allowedRoleIds: ['role-1'],
    };
    const res = videoSchema.safeParse(validVideo);
    assert.equal(res.success, true);

    const invalidVideo = {
      title: 'Py', // too short
      youtubeUrl: 'not-a-url',
      description: 'Py',
      categoryId: '',
      allowedRoleIds: [], // must have at least one role
    };
    const res2 = videoSchema.safeParse(invalidVideo);
    assert.equal(res2.success, false);
  });

  it('should enforce uppercase alphanumeric for role names', () => {
    assert.equal(roleSchema.safeParse({ name: 'EDUCATION' }).success, true);
    assert.equal(roleSchema.safeParse({ name: 'AI_RESEARCHER' }).success, true);
    assert.equal(roleSchema.safeParse({ name: 'lowercase role' }).success, false);
  });
});
