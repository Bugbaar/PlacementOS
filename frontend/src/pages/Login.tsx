import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { loginStudent } from '../store/studentSlice';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStudent, token, loading, error } = useSelector((state: RootState) => state.student);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (token && currentStudent) {
    return (
      <Navigate
        to={currentStudent.role === 'admin' ? '/shortlist' : '/dashboard'}
        replace
      />
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    try {
      await dispatch(loginStudent({ email, password })).unwrap();
    } catch (err: any) {
      setFormError(err?.message || error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-slate-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
            PlacementOS
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in as a student or placement cell admin
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-600">{formError || error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
