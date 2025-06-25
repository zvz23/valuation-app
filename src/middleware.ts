import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token store (in production, use secure session storage)


interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

function rateLimit(ip: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const key = `rate_limit_${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return true;
  }

  if (record.count >= options.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
  
  return xForwardedFor?.split(',')[0] || xRealIp || remoteAddr;
}

function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  // Apply different rate limits based on path
  let rateLimitOptions: RateLimitOptions;
  
  if (pathname.startsWith('/api/auth')) {
    // Stricter rate limiting for authentication endpoints
    rateLimitOptions = { windowMs: 15 * 60 * 1000, maxRequests: 5 }; // 5 requests per 15 minutes
  } else if (pathname.startsWith('/api')) {
    // General API rate limiting
    rateLimitOptions = { windowMs: 15 * 60 * 1000, maxRequests: 100 }; // 100 requests per 15 minutes
  } else {
    // Page requests
    rateLimitOptions = { windowMs: 15 * 60 * 1000, maxRequests: 200 }; // 200 requests per 15 minutes
  }

  // Apply rate limiting
  if (!rateLimit(clientIP, rateLimitOptions)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
        'X-RateLimit-Limit': rateLimitOptions.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + rateLimitOptions.windowMs).toISOString(),
      },
    });
  }


  // Authentication for protected routes
  const protectedPaths = ['/properties', '/property', '/dashboard', '/admin'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get('val-ai-auth')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = await verifyToken(token);
      if (!payload) {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('val-ai-auth');
        return response;
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      // Generate CSRF token for this session
      /*if (!csrfTokenStore.has(token)) {
        csrfTokenStore.set(token, generateCSRFToken());
      }*/

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Set CSRF token in response header
      //response.headers.set('x-csrf-token', csrfTokenStore.get(token) || '');
      
      return response;
    } catch (error) {
      console.error('Token verification error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('val-ai-auth');
      return response;
    }
  }

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('val-ai-auth')?.value;
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'admin') {
          return new NextResponse('Forbidden - Admin Access Required', { status: 403 });
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  // Security headers for all responses
  const response = NextResponse.next();
  
  // Remove server identification
  response.headers.delete('server');
  response.headers.delete('x-powered-by');
  
  // Add security headers (these supplement the ones in next.config.ts)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Add rate limit headers
  const rateLimitRecord = rateLimitStore.get(`rate_limit_${clientIP}`);
  if (rateLimitRecord) {
    response.headers.set('X-RateLimit-Limit', rateLimitOptions.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.maxRequests - rateLimitRecord.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitRecord.resetTime).toISOString());
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 