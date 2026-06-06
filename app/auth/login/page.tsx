'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle } from "../../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock login - in production, this would call Firebase Auth
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }

      await loginWithEmail(email, password);
    router.push("/");

    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h1>
            <p className="text-brand-100">Sign in to access your personalized college recommendations</p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  disabled={loading}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-200 text-brand-600 focus:ring-2 focus:ring-brand-500" />
                <label htmlFor="remember" className="text-sm text-slate-600">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-600 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
  type="button"
  disabled={loading}
  onClick={async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      router.push("/");
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }}
  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
                      <button
          type="button"
          disabled
          title="GitHub login coming soon"
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg opacity-50 cursor-not-allowed font-medium text-slate-700 text-sm">                
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">     
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-slate-600 text-sm">
              Don&rsquo;t have an account?{' '}
              <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            By signing in, you agree to our{' '}
            <Link href="#" className="hover:text-slate-200">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="hover:text-slate-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
