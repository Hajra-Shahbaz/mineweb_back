import { Router } from 'express';
import { 
  createPost, 
  getAllPosts, 
  editPost, 
  deletePost 
} from '../controller/blog.ts';

const router = Router();

router.route('/')
  .post(createPost)
  .get(getAllPosts);

router.route('/:id')
  .put(editPost)
  .delete(deletePost);

export default router;