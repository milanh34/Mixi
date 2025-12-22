import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { 
  createExpense,
  getGroupExpenses,
  getPersonalExpenses,
  settleExpense,
  deleteExpense
} from '../controllers/expense.controller.js';

const router = Router();

router.use(authMiddleware); // All routes require authentication

// Group expenses
router.post('/groups/:groupId/expenses', upload.single('receiptPhoto'), createExpense);
router.get('/groups/:groupId/expenses', getGroupExpenses);
router.get('/groups/:groupId/personal', getPersonalExpenses);

// Expense actions
router.put('/expenses/:expenseId/settle', settleExpense);
router.delete('/expenses/:expenseId', deleteExpense);

export default router;
