import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import dotenv from 'dotenv';

dotenv.config();

const { ETHEREAL_USER, ETHEREAL_PASSWORD } = process.env;
console.log('Ethereal credentials:', { ETHEREAL_USER, ETHEREAL_PASSWORD });
let transporterInstance: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

export const getTransporter = async (): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const testAccount = await nodemailer.createTestAccount();

  transporterInstance = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: ETHEREAL_USER || testAccount.user,
      pass: ETHEREAL_PASSWORD || testAccount.pass,
    },
  });

  return transporterInstance;
};