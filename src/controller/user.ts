import type { Request, Response } from 'express';
import { UserM } from '../model/userM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

/**
 * @desc    Create/Post profile data (Initial setup)
 * @route   POST /api/user
 * @body    { name, email, phoneNumber, title, aboutText, subText }
 */
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingProfile = await UserM.findOne();
    if (existingProfile) {
      res.status(400).json({ message: 'Profile data already exists. Use the edit route instead.' });
      return;
    }

    // Capture fields explicitly or fallback dynamically via spread operator
    const profileData = {
      ...req.body,
      profilePictures: req.body.profilePictures || []
    };

    const newProfile = new UserM(profileData);
    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile data', error });
  }
};

/**
 * @desc    Get profile data
 * @route   GET /api/user
 */
export const getProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    const profile = await UserM.findOne();
    if (!profile) {
      res.status(404).json({ message: 'No profile data found.' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile data', error });
  }
};

/**
 * @desc    Edit/Update specific profile parts dynamically & stream file payloads to S3
 * @route   PUT /api/user
 * @body    { name, email, phoneNumber, title, aboutText, subText, setActiveImageUrl }
 */
export const editProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    let updateFields = { ...req.body };

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // 1. Check if a new Resume Document stream is present
    if (files && files['resume'] && files['resume'][0]) {
      const resumeUrlString = await uploadFileToS3(files['resume'][0], 'resumes');
      updateFields.resumeUrl = resumeUrlString;
    }

    // 2. Fetch the current existing profile to manipulate local data arrays
    const currentProfile = await UserM.findOne();
    if (!currentProfile) {
      res.status(404).json({ message: 'No profile data found to update. Create it first.' });
      return;
    }

    // 3. Handle a new Profile Picture Upload stream (Using 'profileUser' as the field key)
    if (files && files['profileUser'] && files['profileUser'][0]) {
      const uploadedImageUrl = await uploadFileToS3(files['profileUser'][0], 'profilePictures');

      const updatedGallery = currentProfile.profilePictures?.map((img) => ({
        url: img.url,
        isActive: false
      })) || [];

      updatedGallery.push({
        url: uploadedImageUrl,
        isActive: true
      });

      updateFields.profilePictures = updatedGallery;
    }

    // 4. Handle picking/switching an old historical profile picture via text parameter
    if (req.body.setActiveImageUrl) {
      const targetUrl = req.body.setActiveImageUrl;
      
      updateFields.profilePictures = currentProfile.profilePictures.map((img) => ({
        url: img.url,
        isActive: img.url === targetUrl
      }));
      
      delete updateFields.setActiveImageUrl;
    }

    // 5. Execute dynamic database update
    const updatedProfile = await UserM.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true, runValidators: true } // runValidators: true forces email/phone formats to validate
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile data', error });
  }
};

/**
 * @desc    Delete profile data (No ID needed)
 * @route   DELETE /api/user
 */
export const deleteProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    const deletedProfile = await UserM.findOneAndDelete({});
    if (!deletedProfile) {
      res.status(404).json({ message: 'No profile data found to delete.' });
      return;
    }
    res.status(200).json({ message: 'Profile data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile data', error });
  }
};