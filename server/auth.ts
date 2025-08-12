import bcrypt from 'bcrypt';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Session configuration
export function setupSession(app: Express) {
  const pgStore = connectPg(session);
  
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
}

// Authentication middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid user session' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Admin access middleware
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Coordinator or admin access middleware
export async function requireCoordinator(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!['admin', 'coordinator'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Coordinator or admin access required' });
    }
    next();
  });
}

// Authentication helper functions
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Login function
export async function login(username: string, password: string): Promise<User | null> {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Group access middleware - checks if user has access to a group
export async function requireGroupAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const groupId = parseInt(req.params.id || req.params.groupId);
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID required' });
  }

  try {
    // Admin can access any group
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is coordinator of the group or a member
    const hasAccess = await storage.hasGroupAccess(req.user.id, groupId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this group' });
    }

    next();
  } catch (error) {
    console.error('Group access check error:', error);
    res.status(500).json({ error: 'Group access check failed' });
  }
}

// Study access middleware - checks if user has access to a study
export async function requireStudyAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const studyId = parseInt(req.params.studyId);
  if (!studyId) {
    return res.status(400).json({ error: 'Study ID required' });
  }

  try {
    // Admin can access any study
    if (req.user.role === 'admin') {
      return next();
    }

    // Get study and check group access
    const study = await storage.getDelphiStudy(studyId);
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    const hasAccess = await storage.hasGroupAccess(req.user.id, study.groupId || 0);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this study' });
    }

    next();
  } catch (error) {
    console.error('Study access check error:', error);
    res.status(500).json({ error: 'Study access check failed' });
  }
}