import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { 
  createTimelineEvent,
  getGroupTimeline,
  updateTimelineEvent,
  deleteTimelineEvent
} from '../controllers/timeline.controller.js';

const router = Router();

router.use(authMiddleware); // All routes require authentication

// Timeline events
router.post('/groups/:groupId/timeline', upload.array('photos', 5), createTimelineEvent);
router.get('/groups/:groupId/timeline', getGroupTimeline);
router.put('/timeline/:eventId', upload.array('photos', 5), updateTimelineEvent);
router.delete('/timeline/:eventId', deleteTimelineEvent);

export default router;
