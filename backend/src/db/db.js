const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initial database structure
const initialData = {
  users: [],
  messages: [],
  calls: [],
  friendRequests: []
};

// Ensure database file exists
async function initDatabase() {
  try {
    await fs.access(DB_FILE);
    console.log('✅ Database file exists');
  } catch (error) {
    console.log('📁 Creating new database file...');
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return initialData;
  }
}

// Write to database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// CRUD operations for users
const users = {
  async findAll() {
    const db = await readDB();
    return db.users;
  },

  async findById(id) {
    const db = await readDB();
    return db.users.find(user => user.id === id);
  },

  async findByEmail(email) {
    const db = await readDB();
    return db.users.find(user => user.email === email.toLowerCase());
  },

  async findByUsername(username) {
    const db = await readDB();
    return db.users.find(user => user.username === username);
  },

  async findByCode(uniqueCode) {
    const db = await readDB();
    return db.users.find(user => user.uniqueCode === uniqueCode.toUpperCase());
  },

  async create(userData) {
    const db = await readDB();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    await writeDB(db);
    return newUser;
  },

  async update(id, updates) {
    const db = await readDB();
    const index = db.users.findIndex(user => user.id === id);
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeDB(db);
    return db.users[index];
  },

  async delete(id) {
    const db = await readDB();
    const index = db.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    db.users.splice(index, 1);
    await writeDB(db);
    return true;
  }
};

// CRUD operations for friend requests
const friendRequests = {
  async findAll() {
    const db = await readDB();
    return db.friendRequests;
  },

  async findPendingRequests(userId) {
    const db = await readDB();
    return db.friendRequests.filter(
      req => (req.receiverId === userId || req.senderId === userId) && req.status === 'pending'
    );
  },

  async findExisting(senderId, receiverId) {
    const db = await readDB();
    return db.friendRequests.find(
      req => req.senderId === senderId && req.receiverId === receiverId && req.status === 'pending'
    );
  },

  async create(requestData) {
    const db = await readDB();
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      createdAt: new Date().toISOString()
    };
    db.friendRequests.push(newRequest);
    await writeDB(db);
    return newRequest;
  },

  async update(id, updates) {
    const db = await readDB();
    const index = db.friendRequests.findIndex(req => req.id === id);
    if (index === -1) return null;

    db.friendRequests[index] = {
      ...db.friendRequests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeDB(db);
    return db.friendRequests[index];
  },

  async delete(id) {
    const db = await readDB();
    const index = db.friendRequests.findIndex(req => req.id === id);
    if (index === -1) return false;

    db.friendRequests.splice(index, 1);
    await writeDB(db);
    return true;
  }
};

// Initialize database on startup
initDatabase().catch(console.error);

module.exports = {
  readDB,
  writeDB,
  users,
  friendRequests
};