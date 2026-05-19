const bcrypt = require('bcrypt');
const db = require('../config/db');
const logger = require('./logger');

async function initializeAdmin() {
  try {
    const adminExists = await db.users.findOne({ role: 'admin' });

    if (!adminExists) {
      logger.info('No admin found. Creating default admin account...');

      const hashedPassword = await bcrypt.hash(
        'EverySoulWillTasteDeath,Surah-Al-Anbiya_Verse35',
        10
      );

      const admin = {
        username: 'MD.Hasibul Hasan',
        email: 'mdhasibulhasan0210@gmail.com',
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'approved',
        profilePicture: '/assets/images/profile.png',
        createdAt: new Date()
      };

      await db.users.insert(admin);
      logger.info('Admin created → mdhasibulhasan0210@gmail.com');
    } else {
      // Update email if it's the old one
      if (adminExists.email === 'hasibulhasan0210@admin.com') {
        await db.users.update(
          { _id: adminExists._id },
          { $set: { email: 'mdhasibulhasan0210@gmail.com' } }
        );
        logger.info('Admin email updated to mdhasibulhasan0210@gmail.com');
      } else {
        logger.info('Admin account already exists: ' + adminExists.email);
      }
    }

    const settings = await db.settings.findOne({ key: 'site' });
    if (!settings) {
      await db.settings.insert({
        key: 'site',
        bio: 'Personal cloud & digital archive owner.',
        tagline: 'Personal Cloud OS - Store, Organize, Share',
        aboutText:
          'Building a private digital workspace for organizing knowledge, academic resources, and personal files. This system is a personal cloud operating environment designed for structured learning and archive management.',
        createdAt: new Date()
      });
      logger.info('Default site settings created');
    }
  } catch (error) {
    logger.error('Error initializing admin:', error);
  }
}

module.exports = initializeAdmin;
