import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secure-secret-key-change-this-in-production'
);

const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'val-ai-auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'valuer' | 'viewer';
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Mock user database - replace with actual database in production
const users: Map<string, User & { password: string }> = new Map();

// Initialize with a default admin user
const initDefaultUser = async () => {
  const adminEmail = 'admin@valai.com';
  if (!users.has(adminEmail)) {
    const hashedPassword = await hashPassword('Admin123');
    users.set(adminEmail, {
      id: '1',
      email: adminEmail,
      name: 'Admin User',
      role: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
    });
  }
};

// Initialize default user
initDefaultUser();

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT token
 */
export async function createToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Type guard to ensure payload has required properties
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return payload as unknown as AuthPayload;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Set authentication cookie (client-side)
 */
export function setAuthCookie(token: string): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=${token}; path=/; samesite=strict; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} max-age=${60 * 60 * 24 * 7}`;
  }
}

/**
 * Get authentication cookie (client-side)
 */
export function getAuthCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Remove authentication cookie (client-side)
 */
export function removeAuthCookie(): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getAuthCookie();
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = users.get(payload.email);
    if (!user) return null;

    // Update last login
    user.lastLogin = new Date();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = users.get(email.toLowerCase());
    if (!user) return null;

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) return null;

    // Update last login
    user.lastLogin = new Date();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

/**
 * Create new user
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'valuer' | 'viewer' = 'viewer'
): Promise<User | null> {
  try {
    const normalizedEmail = email.toLowerCase();
    
    if (users.has(normalizedEmail)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const userId = Date.now().toString();

    const newUser = {
      id: userId,
      email: normalizedEmail,
      name,
      role,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.set(normalizedEmail, newUser);

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    console.error('User creation failed:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: User, requiredRole: string | string[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}

/**
 * Sign in user and set cookie
 */
export async function signIn(email: string, password: string): Promise<User | null> {
  const user = await authenticateUser(email, password);
  if (!user) return null;

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  setAuthCookie(token);
  return user;
}

/**
 * Sign out user and remove cookie
 */
export function signOut(): void {
  removeAuthCookie();
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  return Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  }));
} 