const fs = require('fs');
const path = require('path');

const MEMBERS_FILE = process.env.NODE_ENV === 'production'
  ? '/railway/data/members.json'
  : path.join(__dirname, '..', '..', 'data', 'members.json');

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
    const raw = fs.readFileSync(MEMBERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeMembers(members) {
  const dir = path.dirname(MEMBERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf-8');
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
