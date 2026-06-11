import type { Request, Response } from 'express';
import { ContactM } from '../model/contactM.ts';

/**
 * @desc    Submit a new contact form message (Stores visitor info + your email)
 * @route   POST /api/contact
 */
export const submitMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extracting fields exactly matching your custom schema names
    const { name, email, mineEmail, phoneNumber, subject, message } = req.body;

    // Validation: Ensure all schema-required fields are present in the request
    if (!name || !email || !mineEmail || !subject || !message) {
      res.status(400).json({ 
        message: 'Validation failed. Name, email, mineEmail, subject, and message are all required.' 
      });
      return;
    }

    // Instantiating the new message matching your schema layout
    const newMessage = new ContactM({ 
      name, 
      email, 
      mineEmail, // Saved exactly as defined in your interface/schema
      phoneNumber, 
      subject, 
      message 
    });

    const savedMessage = await newMessage.save();
    
    // Returns and displays the newly saved document back to the client immediately
    res.status(201).json({ 
      message: 'Message sent and stored successfully!', 
      data: savedMessage 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving message submission', error });
  }
};

/**
 * @desc    Get and display all inbox messages (Sorted by newest first)
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
 * @desc    Mark a message as read/unread dynamically (or update fields via Postman)
 * @route   PUT /api/contact/:id
 */
export const toggleReadStatus = async (req: Request, res: Response): Promise<void> => {
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