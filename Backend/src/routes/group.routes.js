import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { 
  createGroup,
  getUserGroups,
  getGroupById,
  joinGroupByCode,
  generateGroupInvite,
  getGroupInvites
} from '../controllers/group.controller.js';

const router = Router();

router.use(authMiddleware); // All routes require authentication

// Group CRUD
router.post('/', upload.single('photo'), createGroup);
router.get('/', getUserGroups);
router.get('/:id', getGroupById);

// Join group
router.post('/:code/join', joinGroupByCode);

// Invites
router.post('/:id/invite', generateGroupInvite);
router.get('/:id/invites', getGroupInvites);

export default router;
