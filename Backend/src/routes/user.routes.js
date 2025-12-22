import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserStats,
  deactivateUser 
} from '../controllers/user.controller.js';

const router = Router();

router.use(authMiddleware); // All routes require authentication

router.get('/profile', getUserProfile);
router.put('/profile', upload.single('profilePicture'), updateUserProfile);
router.put('/stats', updateUserStats);
router.delete('/deactivate', deactivateUser);

export default router;
