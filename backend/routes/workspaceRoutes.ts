import express from 'express';
import { createWorkspace, getWorkspaces, joinWorkspace } from '../controllers/workspaceController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createWorkspace);
router.get('/', protect, getWorkspaces);
router.post('/:workspaceId/join', protect, joinWorkspace);

export default router;
