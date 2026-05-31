import type { Request, Response } from 'express';
import { ContactM } from '../model/contactM.ts';

/**
 * @desc    Submit a new contact form message (Used by portfolio visitors)
 * @route   POST /api/contact
 */
export const submitMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Name, email, and message are required fields.' });
      return;
    }

    const newMessage = new ContactM({ name, email, subject, message });
    const savedMessage = await newMessage.save();
    
    res.status(201).json({ message: 'Message sent successfully!', data: savedMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error saving message submissions', error });
  }
};

/**
 * @desc    Get all inbox messages (Sorted newest submission first, used by you)
 * @route   GET /api/contact
 */
export const getInbox = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactM.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inbox messages', error });
  }
};

/**
 * @desc    Mark a message as read/unread dynamically
 * @route   PUT /api/contact/:id
 */
export const toggleReadStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedMessage = await ContactM.findByIdAndUpdate(
      id,
      { $set: req.body }, // Send {"isRead": true} from Postman or your admin board
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      res.status(404).json({ message: 'Message not found with that ID' });
      return;
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message status', error });
  }
};

/**
 * @desc    Delete/Discard an inbox message
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

    res.status(200).json({ message: 'Message discarded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};