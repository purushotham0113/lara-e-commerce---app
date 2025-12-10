import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, text, html }) => {
  // Check if credentials are provided in .env
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`
      [EMAIL SERVICE MOCK - CREDENTIALS MISSING]
      To: ${to}
      Subject: ${subject}
      ---------------------
      ${text || 'HTML Content'}
      ---------------------
    `);
    return true;
  }

  try {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // defined in .env
        pass: process.env.EMAIL_PASS, // defined in .env
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"LARA Perfumes" <${process.env.EMAIL_USER}>`, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });

    console.log(`📧 Email sent: ${info.messageId} to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    // Return false but don't crash the server
    return false;
  }
};

export default sendEmail;