const Datastore = require('nedb-promises');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');

// Initialize all collections
const db = {
  users: Datastore.create({
    filename: path.join(dataDir, 'users.db'),
    autoload: true,
    timestampData: true
  }),
  
  subjects: Datastore.create({
    filename: path.join(dataDir, 'subjects.db'),
    autoload: true,
    timestampData: true
  }),
  
  chapters: Datastore.create({
    filename: path.join(dataDir, 'chapters.db'),
    autoload: true,
    timestampData: true
  }),
  
  files: Datastore.create({
    filename: path.join(dataDir, 'files.db'),
    autoload: true,
    timestampData: true
  }),
  
  results: Datastore.create({
    filename: path.join(dataDir, 'results.db'),
    autoload: true,
    timestampData: true
  }),
  
  broadcasts: Datastore.create({
    filename: path.join(dataDir, 'broadcasts.db'),
    autoload: true,
    timestampData: true
  }),
  
  messages: Datastore.create({
    filename: path.join(dataDir, 'messages.db'),
    autoload: true,
    timestampData: true
  }),
  
  notifications: Datastore.create({
    filename: path.join(dataDir, 'notifications.db'),
    autoload: true,
    timestampData: true
  }),
  
  bookmarks: Datastore.create({
    filename: path.join(dataDir, 'bookmarks.db'),
    autoload: true,
    timestampData: true
  }),
  
  settings: Datastore.create({
    filename: path.join(dataDir, 'settings.db'),
    autoload: true,
    timestampData: true
  })
};

// Create indexes for better performance
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.files.ensureIndex({ fieldName: 'uploadedBy' });
db.files.ensureIndex({ fieldName: 'owner' });
db.files.ensureIndex({ fieldName: 'chapterId' });
db.messages.ensureIndex({ fieldName: 'from' });
db.messages.ensureIndex({ fieldName: 'to' });
db.notifications.ensureIndex({ fieldName: 'userId' });

module.exports = db;
