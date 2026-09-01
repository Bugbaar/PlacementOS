import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,  
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP not configured, skipping email delivery to ' + to);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"PlacementOS" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info({ event: 'email_sent', to, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error({ event: 'email_failed', to, error: err.message });
    throw err;
  }
}

export default { sendEmail };
