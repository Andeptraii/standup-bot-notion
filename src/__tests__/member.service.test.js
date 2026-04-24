const fs = require('fs');
const path = require('path');
const { MemberService, MemberValidationError } = require('../services/member');

const MEMBERS_FILE = path.join(__dirname, '..', '..', 'data', 'members.json');

describe('MemberService', () => {
  beforeEach(() => {
    fs.writeFileSync(MEMBERS_FILE, '[]', 'utf-8');
  });

  afterAll(() => {
    fs.writeFileSync(MEMBERS_FILE, '[]', 'utf-8');
  });

  describe('getMembers', () => {
    it('phải trả về mảng rỗng khi file trống', () => {
      expect(MemberService.getMembers()).toEqual([]);
    });

    it('phải trả về mảng rỗng khi file bị lỗi format', () => {
      fs.writeFileSync(MEMBERS_FILE, 'not valid json', 'utf-8');
      expect(MemberService.getMembers()).toEqual([]);
    });

    it('phải trả về mảng rỗng khi file không tồn tại', () => {
      if (fs.existsSync(MEMBERS_FILE)) fs.unlinkSync(MEMBERS_FILE);
      expect(MemberService.getMembers()).toEqual([]);
      fs.writeFileSync(MEMBERS_FILE, '[]', 'utf-8');
    });
  });

  describe('addMember', () => {
    it('phải thêm member hợp lệ vào file', () => {
      const member = MemberService.addMember({
        name: 'An Nguyen',
        email: 'an@nexlab.tech',
        notionId: 'notion-123',
      });
      expect(member).toMatchObject({
        name: 'An Nguyen',
        email: 'an@nexlab.tech',
        notionId: 'notion-123',
      });
      expect(MemberService.getMembers()).toHaveLength(1);
    });

    it('phải throw MemberValidationError khi thiếu name', () => {
      expect(() => MemberService.addMember({ email: 'a@b.com', notionId: 'id-1' })).toThrow(
        MemberValidationError
      );
    });

    it('phải throw MemberValidationError khi thiếu email', () => {
      expect(() => MemberService.addMember({ name: 'Test', notionId: 'id-1' })).toThrow(
        MemberValidationError
      );
    });

    it('phải throw MemberValidationError khi email không hợp lệ', () => {
      expect(() =>
        MemberService.addMember({ name: 'Test', email: 'not-email', notionId: 'id-1' })
      ).toThrow(MemberValidationError);
    });

    it('phải throw MemberValidationError khi notionId bị trùng', () => {
      MemberService.addMember({ name: 'A', email: 'a@a.com', notionId: 'dup-id' });
      expect(() =>
        MemberService.addMember({ name: 'B', email: 'b@b.com', notionId: 'dup-id' })
      ).toThrow(MemberValidationError);
    });
  });

  describe('getMemberByNotionId', () => {
    it('phải trả về member đúng theo notionId', () => {
      MemberService.addMember({ name: 'An', email: 'an@nexlab.tech', notionId: 'id-an' });
      const found = MemberService.getMemberByNotionId('id-an');
      expect(found).toMatchObject({ name: 'An', notionId: 'id-an' });
    });

    it('phải trả về null khi không tìm thấy', () => {
      expect(MemberService.getMemberByNotionId('nonexistent')).toBeNull();
    });
  });

  describe('removeMember', () => {
    it('phải xóa member và trả về true', () => {
      MemberService.addMember({ name: 'An', email: 'an@nexlab.tech', notionId: 'del-id' });
      expect(MemberService.removeMember('del-id')).toBe(true);
      expect(MemberService.getMembers()).toHaveLength(0);
    });

    it('phải trả về false khi không tìm thấy', () => {
      expect(MemberService.removeMember('ghost-id')).toBe(false);
    });
  });
});
