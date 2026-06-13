import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import type { PriorityLevel, MessageCategory } from '../model/contactM.ts';
import { ContactM } from '../model/contactM.ts';

// Configure the email transporter using your .env configuration secrets
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Your generated 16-character App Password
  },
});

/**
 * @desc    Helper to auto-assign priority and category based on keywords (Fallback logic)
 */
const analyzeMessageContext = (subject: string, message: string): { priority: PriorityLevel; category: MessageCategory } => {
  const content = `${subject} ${message}`.toLowerCase();
  
  let category: MessageCategory = 'general';
  let priority: PriorityLevel = 'medium';

  // Smart Categorization
  if (content.includes('bug') || content.includes('error') || content.includes('broken') || content.includes('issue')) {
    category = 'bug_report';
    priority = 'high'; 
  } else if (content.includes('project') || content.includes('hire') || content.includes('work') || content.includes('budget') || content.includes('proposal')) {
    category = 'project_inquiry';
  } else if (content.includes('feedback') || content.includes('suggestion') || content.includes('awesome')) {
    category = 'feedback';
  }

  // Overriding Priority for critical keywords
  if (content.includes('urgent') || content.includes('asap') || content.includes('critical') || content.includes('emergency')) {
    priority = 'urgent';
  } else if (content.includes('low priority') || content.includes('just FYI')) {
    priority = 'low';
  }

  return { priority, category };
};

/**
 * @desc    Submit a new contact form message (Auto-categorizes + Dispatches Real-time Gmail Alert)
 * @route   POST /api/contact
 */
export const submitMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, subject, message, priority, category } = req.body;

    // Validation check
    if (!name || !email || !subject || !message) {
      res.status(400).json({ 
        message: 'Validation failed. Name, email, subject, and message are all required.' 
      });
      return;
    }

    // Determine final status parameters (uses explicit frontend choices or falls back to text analyzer)
    const analysis = analyzeMessageContext(subject, message);
    const finalPriority = priority || analysis.priority;
    const finalCategory = category || analysis.category;

    const newMessage = new ContactM({ 
      name, 
      email, 
      phoneNumber, 
      subject, 
      message,
      priority: finalPriority,
      category: finalCategory
    });

    const savedMessage = await newMessage.save();
    
    // Build an elegant HTML layout notification for your Gmail inbox feed
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1c1917; max-width: 600px; border: 1px solid #e4e4e7; border-radius: 12px; bg-color: #ffffff;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: 700; color: ${savedMessage.priority === 'urgent' ? '#dc2626' : '#0f172a'}; margin: 0;">
            ${savedMessage.priority === 'urgent' ? '🚨 Urgent Portfolio Message!' : '📩 New Portfolio Inquiry'}
          </h2>
        </div>
        
        <div style="margin-bottom: 20px; font-size: 13px;">
          <span style="background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 4px 8px; rounded-radius: 6px; font-weight: 500; text-transform: uppercase; color: #71717a; margin-right: 6px;">
            Priority: ${savedMessage.priority}
          </span>
          <span style="background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 4px 8px; rounded-radius: 6px; font-weight: 500; text-transform: capitalize; color: #71717a;">
            Category: ${savedMessage.category.replace('_', ' ')}
          </span>
        </div>

        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 16px 0;" />
        
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 4px 0; color: #71717a; width: 90px; font-weight: 500;">Sender:</td>
            <td style="padding: 4px 0; color: #1c1917; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #71717a; font-weight: 500;">Email:</td>
            <td style="padding: 4px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
          </tr>
          ${phoneNumber ? `
          <tr>
            <td style="padding: 4px 0; color: #71717a; font-weight: 500;">Phone:</td>
            <td style="padding: 4px 0; color: #1c1917;">${phoneNumber}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 4px 0; color: #71717a; font-weight: 500;">Subject:</td>
            <td style="padding: 4px 0; color: #1c1917;">${subject}</td>
          </tr>
        </table>

        <div style="background-color: #fafafa; border: 1px solid #f4f4f5; padding: 16px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #27272a; white-space: pre-wrap; line-height: 1.5;">${message}</div>
      </div>
    `;

    // Dispatch the payload safely over SMTP protocols asynchronously
    transporter.sendMail({
      from: `"Portfolio Dashboard" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_RECEIVER || process.env.SMTP_USER,
      subject: `${savedMessage.priority === 'urgent' ? '[URGENT] ' : ''}Contact Notification: ${subject}`,
      html: emailHtml,
    }).catch((emailError) => {
      console.error('SMTP Background worker failed to dispatch alert to Gmail account:', emailError);
    });
    
    res.status(201).json({ 
      message: 'Message processed and stored successfully!', 
      data: savedMessage 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving message submission', error });
  }
};

/**
 * @desc    Get and display dashboard messages (Filters by unread, category, priority, & archive status)
 * @route   GET /api/contact
 */
export const getInbox = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isRead, priority, category, isArchived } = req.query;
    
    const filterQuery: any = {};

    // Default to hiding archived items unless explicitly requested
    filterQuery.isArchived = isArchived === 'true';

    if (isRead !== undefined) filterQuery.isRead = isRead === 'true';
    if (priority) filterQuery.priority = priority as string;
    if (category) filterQuery.category = category as string;

    // Sorting structure maps urgent parameters higher up the index array stack
    const messages = await ContactM.find(filterQuery)
      .sort({ 
        createdAt: -1  // Brings the newest submissions forward natively
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inbox messages', error });
  }
};

/**
 * @desc    Dynamically update fields (isRead, priority, category, admin notes) via ID
 * @route   PUT /api/contact/:id
 */
export const updateMessageDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedMessage = await ContactM.findByIdAndUpdate(
      id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      res.status(404).json({ message: 'Message not found with that ID' });
      return;
    }

    res.status(200).json({
      message: 'Message details updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message details', error });
  }
};

/**
 * @desc    Archive/Unarchive a message instead of hard deleting it
 * @route   PATCH /api/contact/:id/archive
 */
export const toggleArchiveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body; 

    const updatedMessage = await ContactM.findByIdAndUpdate(
      id,
      { $set: { isArchived: isArchived ?? true } },
      { new: true }
    );

    if (!updatedMessage) {
      res.status(404).json({ message: 'Message not found with that ID' });
      return;
    }

    res.status(200).json({ 
      message: updatedMessage.isArchived ? 'Message sent to archive' : 'Message restored to inbox', 
      data: updatedMessage 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling archive status', error });
  }
};

/**
 * @desc    Hard Delete/Permanent purge an inbox message
 * @route   DELETE /api/contact/:id
 */
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedMessage = await ContactM.findByIdAndDelete(id);

    if (!deletedMessage) {
      res.status(404).json({ message: 'Message not found with that ID' });
      return;
    }

    res.status(200).json({ message: 'Message completely purged from database.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};