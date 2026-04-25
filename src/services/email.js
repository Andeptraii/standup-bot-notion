const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailServiceError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'EmailServiceError';
    this.cause = cause;
  }
}

function createTransport() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    const missing = [];
    if (!smtpHost) missing.push('SMTP_HOST');
    if (!smtpUser) missing.push('SMTP_USER');
    if (!smtpPass) missing.push('SMTP_PASS');
    throw new Error(`SMTP config chưa đầy đủ: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function morningTemplate(name, pageLink) {
  return {
    subject: `[Standup] Điền standup của bạn hôm nay nhé, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2b6cb0;">Chào ${name}! 👋</h2>
        <p>Đã đến giờ điền standup hằng ngày rồi. Hãy chia sẻ với team những gì bạn đang làm nhé!</p>

        <div style="background: #f7fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin-top: 0; color: #2d3748; font-weight: bold;">📝 Điền 3 phần sau:</p>
          <ul style="color: #4a5568; margin: 8px 0;">
            <li><strong>Hôm qua:</strong> Những gì bạn đã hoàn thành</li>
            <li><strong>Hôm nay:</strong> Kế hoạch công việc hôm nay</li>
            <li><strong>Blocker:</strong> Có gì cản trở không? (để trống nếu không có)</li>
          </ul>
        </div>

        <p style="color: #718096; font-size: 13px; margin: 16px 0;">
          💡 <strong>Ví dụ:</strong><br>
          <em>Hôm qua: Hoàn thành API endpoint GET /users, Code review PR #45</em><br>
          <em>Hôm nay: Implement feature search, Unit test, Standup meeting</em><br>
          <em>Blocker: Chờ API spec từ PM</em>
        </p>

        <p style="text-align: center; margin: 24px 0;">
          <a href="${pageLink}"
             style="display:inline-block;padding:12px 32px;background:#2b6cb0;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">
            Điền Standup Ngay →
          </a>
        </p>

        <p style="color: #a0aec0; font-size: 12px; margin-top: 16px;">
          ⏰ <strong>Thời hạn:</strong> 8:55 AM (nếu không điền sẽ nhận email nhắc nhở)<br>
          Chỉ mất 2 phút! Cảm ơn bạn! 🙏
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;">
        <p style="color: #a0aec0; font-size: 11px;">Email này được gửi tự động bởi Standup Bot của Nexlab.</p>
      </div>
    `,
  };
}

function reminderTemplate(name, pageLink) {
  return {
    subject: `[Nhắc nhở] Bạn chưa điền standup hôm nay, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c53030;">Nhắc nhở: Chưa điền standup! ⚠️</h2>
        <p>Chào <strong>${name}</strong>, standup của bạn hôm nay vẫn chưa được điền.</p>
        <p>Team đang chờ cập nhật từ bạn. Chỉ mất 2 phút thôi! Cùng điền ngay nào:</p>

        <div style="background: #fff5f5; padding: 16px; border-left: 4px solid #c53030; margin: 16px 0;">
          <p style="margin-top: 0; color: #742a2a;"><strong>📝 Điền 3 phần:</strong></p>
          <ul style="color: #742a2a; margin: 8px 0; padding-left: 20px;">
            <li><strong>Hôm qua:</strong> Những gì đã hoàn thành</li>
            <li><strong>Hôm nay:</strong> Kế hoạch hôm nay</li>
            <li><strong>Blocker:</strong> Gì cản trở (nếu có)</li>
          </ul>
        </div>

        <p style="text-align: center; margin: 24px 0;">
          <a href="${pageLink}"
             style="display:inline-block;padding:12px 32px;background:#c53030;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">
            Điền Ngay →
          </a>
        </p>

        <p style="color: #a0aec0; font-size: 12px;">
          Cảm ơn bạn! 🙏
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;">
        <p style="color: #a0aec0; font-size: 11px;">Email này được gửi tự động bởi Standup Bot của Nexlab.</p>
      </div>
    `,
  };
}

const EmailService = {
  _getTransport: createTransport,

  async sendMorningInvite(email, name, pageLink) {
    const transport = EmailService._getTransport();
    const { subject, html } = morningTemplate(name, pageLink);
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'Standup Bot <bot@nexlab.tech>',
        to: email,
        subject,
        html,
      });
      logger.info(`Gửi email mời standup thành công`, { email, name });
    } catch (err) {
      logger.error(`Gửi email mời standup thất bại: ${err.message} [code=${err.code}] [response=${err.response}] [to=${email}]`);
      throw new EmailServiceError(`Không thể gửi email cho ${email}`, err);
    }
  },

  async sendReminder(email, name, pageLink) {
    const transport = EmailService._getTransport();
    const { subject, html } = reminderTemplate(name, pageLink);
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'Standup Bot <bot@nexlab.tech>',
        to: email,
        subject,
        html,
      });
      logger.info(`Gửi email nhắc nhở thành công tới ${email}`);
    } catch (err) {
      logger.error(`Gửi email nhắc nhở thất bại: ${err.message} [code=${err.code}] [response=${err.response}] [to=${email}]`);
      throw new EmailServiceError(`Không thể gửi email cho ${email}`, err);
    }
  },
};

module.exports = { EmailService, EmailServiceError };
