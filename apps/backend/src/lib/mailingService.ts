import nodemailer from 'nodemailer';

// Real Nodemailer transporter (for production/staging)
// TODO: uncomment when in production
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

export const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});
