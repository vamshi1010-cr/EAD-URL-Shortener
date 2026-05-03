import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import ApiService from './services/ApiService';
import AnalyticsChart from './components/AnalyticsChart';

const authStorage = {
  getToken: () => window.localStorage.getItem('token'),
  setToken: (token) => window.localStorage.setItem('token', token),
  clear: () => window.localStorage.removeItem('token'),
};

const trimUrl = (url) => {
  if (url.length > 60) {
    return `${url.slice(0, 40)}...${url.slice(-15)}`;
  }
  return url;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const deviceIcon = (device) => {
  if (device === 'Mobile') return '📱';
  if (device === 'Tablet') return '📟';
  return '🖥️';
};

const ProtectedRoute = ({ children }) => {
  return authStorage.getToken() ? children : <Navigate to="/login" replace />;
};

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="container mx-auto px-4 py-10">
      {children}
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await ApiService.login(form);
      authStorage.setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-slate-500">Access your enterprise URL dashboard.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800" type="submit">
            Sign In
          </button>
          <p className="text-center text-sm text-slate-500">
            New to the app? <Link className="font-semibold text-blue-600" to="/register">Register</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await ApiService.register(form);
      authStorage.setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">Register</h1>
        <p className="mt-2 text-slate-500">Create your secure shortening workspace.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </label>
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800" type="submit">
            Create Account
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link className="font-semibold text-blue-600" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [heroUrl, setHeroUrl] = useState('');
  const [shortResult, setShortResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const [urlsRes, analyticsRes] = await Promise.all([ApiService.fetchUrls(), ApiService.fetchClicksLast7Days()]);
      setUrls(urlsRes.data.urls || []);
      setAnalytics(analyticsRes.data.clicksByDay || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateShortUrl = async (event) => {
    event.preventDefault();
    if (!heroUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.createShortUrl({ originalUrl: heroUrl });
      setShortResult(response.data);
      setQrPreview(response.data.url.qrCodeData);
      setHeroUrl('');
      fetchDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create short link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortResult?.shortUrl) return;
    await navigator.clipboard.writeText(shortResult.shortUrl);
  };

  const handleLogout = () => {
    authStorage.clear();
    navigate('/login');
  };

  const totalClicks = useMemo(() => urls.reduce((sum, url) => sum + (url.clicks || 0), 0), [urls]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl bg-white p-6 shadow-soft">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900">Enterprise Shortener</h1>
              <p className="mt-2 text-sm text-slate-500">Analytics, QR sharing, and link management in one dashboard.</p>
            </div>
            <nav className="space-y-3 text-sm text-slate-700">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block w-full rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100">
                Shorten URL
              </button>
              <button onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })} className="block w-full rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100">
                Analytics
              </button>
              <button onClick={() => document.getElementById('links-table')?.scrollIntoView({ behavior: 'smooth' })} className="block w-full rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100">
                Links
              </button>
              <button onClick={handleLogout} className="mt-4 block w-full rounded-2xl bg-slate-900 px-4 py-3 text-left text-white transition hover:bg-slate-800">
                Logout
              </button>
            </nav>
          </aside>

          <main>
            <section className="rounded-3xl bg-white p-8 shadow-soft">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-blue-600">Fast URL creation</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Paste a link to generate a short URL and QR code.</h2>
                  <p className="mt-2 text-slate-500">A clean enterprise interface for sharing and tracking your links.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-5 py-4 shadow-sm">
                  <p className="text-sm text-slate-500">Total clicks</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalClicks}</p>
                </div>
              </div>

              <form className="mt-8 space-y-4" onSubmit={handleCreateShortUrl}>
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <input
                    type="url"
                    placeholder="https://example.com/enterprise-offer"
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="rounded-3xl bg-slate-900 px-6 py-4 text-white transition hover:bg-slate-800" disabled={loading}>
                    {loading ? 'Generating...' : 'Shorten'}
                  </button>
                </div>
                {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              </form>

              {shortResult && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm text-slate-500">Short URL created</p>
                  <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="break-all text-sm text-slate-900">{shortResult.shortUrl}</div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleCopy} className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700">
                        Copy
                      </button>
                    </div>
                  </div>
                  {qrPreview && (
                    <div className="mt-6 grid items-center gap-6 lg:grid-cols-[auto_1fr]">
                      <img src={qrPreview} alt="QR Code" className="h-40 w-40 rounded-3xl border border-slate-200 bg-white p-4" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">QR Code Ready</h3>
                        <p className="mt-2 text-slate-500">This QR code is stored with the URL so it does not need to be regenerated every time.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section id="analytics-section" className="mt-6">
              <AnalyticsChart data={analytics} />
            </section>

            <section id="links-table" className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Your Shortened Links</h2>
                  <p className="mt-1 text-sm text-slate-500">Review clicks and QR access for each link.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600">Original URL</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Short URL</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Clicks</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Device</th>
                      <th className="px-4 py-3 font-medium text-slate-600">QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {urls.map((url) => (
                      <tr key={url._id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-700">{trimUrl(url.originalUrl)}</td>
                        <td className="px-4 py-4 break-all">
                        <a
                          href={`${apiBaseUrl}/r/${url.shortCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {`${apiBaseUrl}/r/${url.shortCode}`}
                        </a>
                      </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">{url.clicks || 0}</td>
                        <td className="px-4 py-4">{deviceIcon(url.lastDevice || 'Desktop')}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setQrPreview(url.qrCodeData)}
                            className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
                          >
                            View QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {qrPreview && (
              <section className="mt-6 rounded-3xl bg-slate-50 p-6 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">QR Preview</h3>
                    <p className="mt-1 text-sm text-slate-500">Click a link to view its stored QR code.</p>
                  </div>
                  <button onClick={() => setQrPreview(null)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100">
                    Close Preview
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <img className="h-56 w-56 rounded-3xl border border-slate-200 bg-white p-4" src={qrPreview} alt="QR Preview" />
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={authStorage.getToken() ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
