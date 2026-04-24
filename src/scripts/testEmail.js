#!/usr/bin/env node
require('dotenv').config();
const { EmailService } = require('../services/email');
const logger = require('../utils/logger');

async function testEmail() {
  const testEmail = 'khanhanuni7923@gmail.com';
  const testName = 'Test User';
  const testPageLink = 'https://www.notion.so/test-page-id';

  console.log('\n🧪 Testing Brevo SMTP Configuration...\n');
  console.log('📧 Test Email Details:');
  console.log(`   To: ${testEmail}`);
  console.log(`   Name: ${testName}`);
  console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`   From: ${process.env.SMTP_FROM}\n`);

  try {
    console.log('📤 Sending test email...');
    await EmailService.sendMorningInvite(testEmail, testName, testPageLink);
    console.log('✅ Email sent successfully!\n');
    console.log('💡 Check your email inbox (or spam folder) for the test email.');
    console.log('   If you received it, Brevo SMTP is configured correctly! 🎉\n');
  } catch (err) {
    console.error('❌ Failed to send email:\n');
    console.error('Error:', err.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check SMTP_USER and SMTP_PASS in .env');
    console.error('2. Make sure Brevo account is activated');
    console.error('3. Check if sender email is verified in Brevo');
    console.error('4. Try sending from Brevo dashboard first\n');
    process.exit(1);
  }
}

testEmail();
