import type { Request, Response } from 'express';
import { BlogM } from '../model/blogM.ts';

/**
 * @desc    Publish a new blog post
 * @route   POST /api/blog
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, tags, coverImageUrl } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required fields.' });
      return;
    }

    // Auto-generate a clean URL slug from the title (e.g., "Hello World!" -> "hello-world")
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens from edges

    // Verify slug uniqueness
    const existingSlug = await BlogM.findOne({ slug });
    if (existingSlug) {
      res.status(400).json({ message: 'An article with a similar title already exists.' });
      return;
    }

    const newPost = new BlogM({
      title,
      slug,
      content,
      tags,
      coverImageUrl
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error publishing blog post', error });
  }
};

/**
 * @desc    Get all blog posts (Newest articles first)
 * @route   GET /api/blog
 */
export const getAllPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await BlogM.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving blog posts', error });
  }
};

/**
 * @desc    Edit specific sections of an article dynamically
 * @route   PUT /api/blog/:id
 */
export const editPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // If they are changing the title, let's regenerate the slug dynamically too
    if (req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const updatedPost = await BlogM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      res.status(404).json({ message: 'Article entry not found' });
      return;
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blog/:id
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogM.findByIdAndDelete(id);

    if (!deletedPost) {
      res.status(404).json({ message: 'Article entry not found' });
      return;
    }

    res.status(200).json({ message: 'Blog article removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing blog post', error });
  }
};