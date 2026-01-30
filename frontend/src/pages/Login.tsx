import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username: username.trim(),
        password: password.trim(),
      });

      const token = response.data?.access_token;
      const userData = response.data?.user;

      if (token) {
        localStorage.setItem('token', token);
      }

      if (userData) {
        localStorage.setItem('username', userData.username ?? '');
        localStorage.setItem('role', userData.role ?? '');
        if (userData.id !== undefined && userData.id !== null) {
          localStorage.setItem('userId', String(userData.id));
        }
      }

      if (userData?.username) {
        alert('Login Berhasil! Selamat datang, ' + userData.username);
      }

      navigate('/dashboard');
    } catch (error: any) {
      const pesanError =
        error.response?.data?.message || error.message || 'Gagal terhubung ke server';
      alert('Gagal Masuk: ' + pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-white">
      {/* === KIRI (FORM) === */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-24">
        <div className="w-full max-w-md">
          {/* LOGO */}
          <div className="mb-10 flex justify-center md:justify-start">
            <img src="/logo.png" alt="Logo" className="h-12" />
          </div>

          {/* CARD */}
          <div className="border-2 border-orange-300 rounded-3xl p-10 shadow-md bg-white">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">Sign In</h1>

            <form onSubmit={handleLogin}>
              {/* USERNAME */}
              <div className="mb-6">
                <label className="block mb-2 text-sm text-gray-600">Username</label>
                <input
                  type="text"
                  placeholder="Masukkan username Anda"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-8">
                <label className="block mb-2 text-sm text-gray-600">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-lg transition"
              >
                {loading ? 'Masuk...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* === KANAN (BANNER) === */}
      <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center overflow-hidden">
        <img src="/banner-login.jpg" alt="Banner" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
