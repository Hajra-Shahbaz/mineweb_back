import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (to: string) => {
  const mailOptions = {
    from: '"HASoftz Team" <' + process.env.SMTP_USER + '>',
    to,
    subject: "Welcome to HASoftz! 🚀",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to HASoftz!</h2>
        <p>Hi there,</p>
        <p>Thanks for joining the HASoftz newsletter! We're excited to have you on board. You'll be the first to know about our latest project launches, updates, and developer insights.</p>
        <div style="margin: 30px 0;">
          <a href="https://hasoftz.com" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Our Website</a>
        </div>
        <p>Stay tuned for more updates!</p>
        <p style="color: #888; font-size: 12px;">Best regards,<br>The HASoftz Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};