import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a workspace
export const createWorkspace = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: req.user.id,
      members: { create: [{ userId: req.user.id, role: 'owner' }] },
    },
    include: { members: true },
  });

  res.status(201).json(workspace);
};

// List all workspaces (show if user is a member or not)
export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  // Get all workspaces
  const workspaces = await prisma.workspace.findMany({
    include: {
      members: true,
    },
  });

  // Map to indicate if the logged-in user is a member
  const result = workspaces.map(ws => {
    const isMember = ws.members.some(m => m.userId === req.user!.id);
    return {
      id: ws.id,
      name: ws.name,
      isMember,
    };
  });

  res.json(result);
};

// Join a workspace
export const joinWorkspace = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.params;
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const existing = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: Number(workspaceId),
      userId: req.user.id,
    },
  });

  if (existing) return res.status(400).json({ message: 'Already a member' });

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: Number(workspaceId),
      userId: req.user.id,
      role: 'member',
    },
  });

  res.status(201).json(member);
};
