const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter based on environment
let transporter;

if (process.env.NODE_ENV === 'test' || process.env.EMAIL_HOST === 'ethereal') {
  // Use Ethereal Email for testing
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test123'
    }
  });
} else {
  // Use real SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@ethereal.email',
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    // For Ethereal Email, log the preview URL
    if (process.env.NODE_ENV === 'test' || process.env.EMAIL_HOST === 'ethereal') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendEmail }; 