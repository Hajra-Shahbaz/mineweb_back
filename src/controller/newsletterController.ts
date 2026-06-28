import { type Request, type Response } from 'express';
import Newsletter from '../model/newsletter.ts';
import { sendWelcomeEmail } from '../utils/mailer.ts';
import nodemailer from 'nodemailer';

// Configure transporter for the admin notification
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 1. Subscribe Function
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existing = await Newsletter.findOne({ email } as any);
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // Create new subscription
    const newSubscriber = await Newsletter.create({ email });

    // A. Send welcome email to the subscriber
    await sendWelcomeEmail(email);

    // B. Send alert to YOU (The Admin)
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_RECEIVER,
      subject: "🔔 New Subscriber Alert!",
      text: `Someone just subscribed to your newsletter: ${email}`,
    });
    
    return res.status(201).json({ 
      message: "🎉 Thank you for subscribing!",
      data: newSubscriber 
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid email format." });
    }
    console.error("Newsletter Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// 2. Get All Subscribers Function
export const getAllSubscribers = async (_req: Request, res: Response) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true } as any)
      .sort({ subscribedAt: -1 });
    
    return res.status(200).json({
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscribers." });
  }
};