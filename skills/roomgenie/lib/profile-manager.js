const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.roomgenie');
const PROFILE_FILE = path.join(PROFILE_DIR, 'profile.json');

function ensureProfileDir() {
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }
}

function getDefaultProfile() {
  return {
    version: '1.0',
    preferences: {},
    history: {
      recentSearches: [],
      viewedHotels: [],
      bookedHotels: []
    },
    persona: {},
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

function loadProfile() {
  ensureProfileDir();
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      const content = fs.readFileSync(PROFILE_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading profile, using default:', e.message);
      return getDefaultProfile();
    }
  }
  return getDefaultProfile();
}

function saveProfile(profile) {
  ensureProfileDir();
  profile.metadata.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
}

function addRecentSearch(search) {
  const profile = loadProfile();
  profile.history.recentSearches.unshift({
    ...search,
    timestamp: new Date().toISOString()
  });
  // Keep only last 20 searches
  profile.history.recentSearches = profile.history.recentSearches.slice(0, 20);
  saveProfile(profile);
}

module.exports = {
  loadProfile,
  saveProfile,
  addRecentSearch,
  PROFILE_DIR,
  PROFILE_FILE
};
