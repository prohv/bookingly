import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuth } from '../services/mockApi';
import { useAuth } from '../App';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate Google OAuth response processing
      const user = await mockAuth.login(email);
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Bookingly</h1>
        <p className="text-slate-500">Short-term resource scheduling.</p>
      </div>

      {/* Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl w-full max-w-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Student Sign In</h2>
          <p className="text-sm text-slate-500 mt-2">Access is restricted to <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">@college.edu</span> accounts.</p>
        </div>

        {/* Mock Google Button Area */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
             {/* Simulating the email coming from Google Provider selection */}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Simulate Google OAuth</label>
            <input 
              type="email"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Sign in with Google
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Bookingly Inc.
      </p>
    </div>
  );
};