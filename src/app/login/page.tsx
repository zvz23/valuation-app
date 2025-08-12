'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { signIn, getCurrentUser } from '@/lib/auth';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { z } from 'zod';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginInput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/properties');
      }
    };
    checkAuth();
  }, [router]);

  // Get CSRF token
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf', { method: 'GET' });
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.warn('CSRF endpoint not available, continuing without token');
          setCsrfToken('fallback-token');
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        setCsrfToken('fallback-token');
      }
    };
    fetchCSRFToken();
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutEndTime) {
      const timer = setInterval(() => {
        if (new Date() > lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setLoginAttempts(0);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutEndTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors as user types
    if (errors[name as keyof LoginInput]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: Partial<LoginInput> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
        setErrors(formErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Account temporarily locked due to multiple failed login attempts.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await signIn(formData.email, formData.password);
      
      if (user) {
        // Reset login attempts on successful login
        setLoginAttempts(0);
        setIsLocked(false);
        setLockoutEndTime(null);
        
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'valuer':
            router.push('/properties');
            break;
          default:
            router.push('/properties');
        }
      } else {
        // Handle failed login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockoutEndTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes lockout
          setErrors({ email: 'Too many failed attempts. Account locked for 15 minutes.' });
        } else {
          setErrors({ 
            email: `Invalid email or password. ${5 - newAttempts} attempts remaining.` 
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingLockoutTime = (): string => {
    if (!lockoutEndTime) return '';
    const remaining = Math.ceil((lockoutEndTime.getTime() - new Date().getTime()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                  <Building className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-lg mb-2">
              SMARTval
            </h1>
            <p className="text-gray-600 font-medium mb-2">Alliance Australia Property</p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              Secure Login Portal
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading || isLocked}
                    className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || isLocked}
                    className={`block w-full pl-10 pr-12 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    } focus:ring-4 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Lockout Warning */}
              {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Account Temporarily Locked</p>
                      <p className="text-sm text-red-600">
                        Please wait {getRemainingLockoutTime()} before trying again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <span className="relative flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Sign In Securely
                  </span>
                )}
              </button>
            </form>


            {/* Default Login Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">Demo Login:</p>
                <p>Email: <code className="bg-gray-200 px-2 py-1 rounded">admin@valai.com</code></p>
                <p>Password: <code className="bg-gray-200 px-2 py-1 rounded">Admin123</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 