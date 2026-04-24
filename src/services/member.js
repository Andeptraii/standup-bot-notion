const fs = require('fs');
const path = require('path');

// Determine the best writable path for members file
function getWritablePath() {
  const primaryPath = process.env.MEMBERS_FILE_PATH || (
    process.env.NODE_ENV === 'production'
      ? '/data/members.json'
      : path.join(__dirname, '..', '..', 'data', 'members.json')
  );

  // Check if primary path is writable
  try {
    const dir = path.dirname(primaryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Test write permission
    fs.accessSync(dir, fs.constants.W_OK);
    return primaryPath;
  } catch (err) {
    // Fallback to temp directory if primary path is not writable
    console.warn(`Primary path not writable: ${primaryPath}, using /tmp fallback`);
    return '/tmp/members.json';
  }
}

const MEMBERS_FILE = getWritablePath();

class MemberValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MemberValidationError';
  }
}

function validateMember(data) {
  const required = ['name', 'email', 'notionId'];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
      throw new MemberValidationError(`Trường bắt buộc "${field}" bị thiếu hoặc không hợp lệ`);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new MemberValidationError('Email không hợp lệ');
  }
}

function readMembers() {
  try {
    // Kiểm tra thư mục tồn tại
    const dir = path.dirname(MEMBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Kiểm tra file tồn tại
    if (!fs.existsSync(MEMBERS_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(MEMBERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Lỗi đọc members file:', err);
    return [];
  }
}

function writeMembers(members) {
  try {
    const dir = path.dirname(MEMBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi ghi members file:', err);
    throw err;
  }
}

const MemberService = {
  getMembers() {
    return readMembers();
  },

  getMemberByNotionId(notionId) {
    const members = readMembers();
    return members.find((m) => m.notionId === notionId) || null;
  },

  getMemberByEmail(email) {
    const members = readMembers();
    return members.find((m) => m.email === email) || null;
  },

  addMember(data) {
    validateMember(data);
    const members = readMembers();
    if (members.find((m) => m.notionId === data.notionId)) {
      throw new MemberValidationError(`Member với notionId "${data.notionId}" đã tồn tại`);
    }
    const newMember = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      notionId: data.notionId.trim(),
    };
    members.push(newMember);
    writeMembers(members);
    return newMember;
  },

  removeMember(notionId) {
    const members = readMembers();
    const index = members.findIndex((m) => m.notionId === notionId);
    if (index === -1) return false;
    members.splice(index, 1);
    writeMembers(members);
    return true;
  },

  updateMember(notionId, updates) {
    const members = readMembers();
    const index = members.findIndex((m) => m.notionId === notionId);
    if (index === -1) return null;
    const updated = { ...members[index], ...updates, notionId };
    validateMember(updated);
    members[index] = updated;
    writeMembers(members);
    return updated;
  },
};

module.exports = { MemberService, MemberValidationError };
