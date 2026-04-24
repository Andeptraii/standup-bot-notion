const nodemailer = require('nodemailer');
const { EmailService, EmailServiceError } = require('../services/email');

jest.mock('nodemailer');

describe('EmailService', () => {
  let mockSendMail;

  beforeEach(() => {
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'pass';
    process.env.SMTP_FROM = 'Bot <bot@test.com>';

    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });
  });

  describe('sendMorningInvite', () => {
    it('phải gọi sendMail với email, name, link đúng', async () => {
      await EmailService.sendMorningInvite('an@nexlab.tech', 'An', 'https://notion.so/page-1');

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.to).toBe('an@nexlab.tech');
      expect(callArg.subject).toContain('An');
      expect(callArg.html).toContain('https://notion.so/page-1');
    });
  });

  describe('sendReminder', () => {
    it('phải gọi sendMail với email và link đúng', async () => {
      await EmailService.sendReminder('an@nexlab.tech', 'An', 'https://notion.so/page-1');

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.to).toBe('an@nexlab.tech');
      expect(callArg.html).toContain('https://notion.so/page-1');
    });

    it('phải throw EmailServiceError khi gửi mail thất bại', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(
        EmailService.sendReminder('bad@email.com', 'Test', 'https://notion.so/page')
      ).rejects.toThrow(EmailServiceError);
    });
  });
});
