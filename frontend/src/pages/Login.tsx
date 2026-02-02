import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Icon mata
import { useNavigate } from 'react-router-dom'; // Untuk pindah halaman
import axios from 'axios'; // Import Axios

export default function Login() {
  // State untuk tampilan password
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk menyimpan input user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Biar tombolnya ada efek loading
  
  const navigate = useNavigate();

  // Function saat tombol "Sign In" diklik
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh
    setLoading(true);

    try {
      // 1. Panggil Backend
      const response = await axios.post('http://localhost:3000/auth/login', {
        username: username,
        password: password
      });

      // 2. Ambil data dari respon backend
      // (Sesuaikan dengan struktur respon backendmu, biasanya ada di response.data.data atau response.data)
      const userData = response.data.data || response.data; 
      console.log("Login Sukses:", userData);
      
      // 3. SIMPAN DATA KE LOCAL STORAGE (PENTING!)
      // Kita simpan seluruh objek user biar nanti Dashboard bisa ambil nama & role-nya
      localStorage.setItem("user", JSON.stringify(userData));

      // 4. CEK ROLE & ARAHKAN HALAMAN (LOGIC BARU)
      if (userData.role === 'admin') {
         alert("Selamat Datang, Admin!");
         navigate('/admin-dashboard'); // Masuk ke Dashboard Khusus Admin
      } else {
         alert("Login Berhasil! Selamat datang, " + userData.username);
         navigate('/dashboard'); // Masuk ke Dashboard User Biasa
      }

    } catch (error: any) {
      // Jika gagal
      console.error("Error Login:", error);
      const pesanError = error.response?.data?.message || "Gagal terhubung ke server";
      alert("Gagal Masuk: " + pesanError);
    } finally {
      setLoading(false); // Matikan loading selesai atau gagal
    }
  };

  return (
    // Container Utama
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* === BAGIAN KIRI (FORM) === */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 py-12">
        
        {/* LOGO */}
        <div className="mb-8 flex justify-center md:justify-start">
           <img 
             src="/logo.png" 
             alt="Logo RuMate" 
             className="h-12 object-contain" 
           />
        </div>

        {/* KOTAK FORM */}
        <div className="border-2 border-orange-300 rounded-3xl p-8 md:p-12 shadow-sm bg-white relative">
            
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Sign in</h2>
            
            <form onSubmit={handleLogin}>
              
              {/* Input Username */}
              <div className="mb-6">
                <label className="block text-gray-600 text-sm font-medium mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  className="w-full px-4 py-3 rounded-lg border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              {/* Input Password */}
              <div className="mb-8">
                <label className="block text-gray-600 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Tombol Sign In */}
              <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors text-lg disabled:bg-gray-300"
              >
                  {loading ? 'Sedang Masuk...' : 'Sign in'}
              </button>
            </form>
        </div>
      </div>

      {/* === BAGIAN KANAN (GAMBAR BANNER) === */}
      <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center relative overflow-hidden">
        <img 
          src="/banner-login.jpg" 
          alt="Illustration" 
          className="w-full h-full object-cover" 
        />
      </div>

    </div>
  );
}