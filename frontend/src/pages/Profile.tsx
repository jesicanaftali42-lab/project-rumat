import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  
  // --- STATE (Data Sementara) ---
  // Kita gunakan state agar formnya terlihat "hidup" (bisa diedit di layar)
  // Nanti data ini yang akan dikirim ke backend.
  const [usernameDisplay, setUsernameDisplay] = useState("User");
  const [roleDisplay, setRoleDisplay] = useState("SIT"); // Default SIT sesuai desain
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [location, setLocation] = useState("");

  // --- EFEK (Ambil Data Login) ---
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");
    
    if (!savedName) {
        navigate('/'); // Kalau belum login, tendang keluar
    } else {
        // Set data dasar dari yang login
        setUsernameDisplay(savedName);
        setRoleDisplay(savedRole || "SIT");
        // Isi dummy data lainnya berdasarkan nama user
        setEmail(`${savedName.toLowerCase()}@rumate.com`);
        setDivision(savedRole || "SIT");
    }
  }, [navigate]);

  // --- FUNGSI TOMBOL SIMPAN (Sementara) ---
  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Fitur simpan data belum tersedia saat ini.");
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800">
      
      {/* 1. SIDEBAR KIRI (Konsisten di semua halaman) */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Users size={20} />} label="Meeting Rooms" onClick={() => navigate('/meeting-rooms')} />
          <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
          {/* Menu Profile Aktif */}
          <NavItem icon={<User size={20} />} label="Profile" active onClick={() => navigate('/profile')} />
        </nav>

        <button onClick={() => {localStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* 2. KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto">
        
        {/* HEADER & BANNER */}
        <div className="p-8 pb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
            
            {/* Banner Gradien (Sesuai Desain) */}
            <div className="h-48 w-full bg-gradient-to-r from-blue-200 to-orange-100 rounded-3xl"></div>

            {/* Foto Profil & Nama (Posisi Overlap ke Atas Banner) */}
            <div className="flex items-end gap-6 px-6 -mt-16 relative z-10">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-sm">
                    <div className="w-full h-full bg-blue-100 rounded-full overflow-hidden border-4 border-white">
                        {/* Menggunakan DiceBear untuk foto dinamis berdasarkan username */}
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${usernameDisplay}`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{usernameDisplay}</h2>
                    <p className="text-gray-500 font-medium uppercase">{roleDisplay}</p>
                </div>
            </div>
        </div>

        {/* FORM PROFILE INFORMATION */}
        <div className="p-8 pt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
            
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-4xl">
                    
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            value={usernameDisplay}
                            onChange={(e) => setUsernameDisplay(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all"
                            placeholder="Your Full Name"
                        />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all"
                            placeholder="Your Email Address"
                        />
                    </div>

                    {/* Division */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Division</label>
                        <input 
                            type="text" 
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all"
                            placeholder="Your Division"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Phone</label>
                        <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all"
                            placeholder="Your Number Phone"
                        />
                    </div>

                     {/* Role */}
                     <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Role</label>
                        <input 
                            type="text" 
                            value={roleDisplay}
                            onChange={(e) => setRoleDisplay(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all capitalize"
                            placeholder="Your Role"
                        />
                    </div>

                    {/* Office Location */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Office Location</label>
                        <input 
                            type="text" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-4 rounded-xl bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-700 font-medium outline-none transition-all"
                            placeholder="Your Office Location"
                        />
                    </div>
                </div>

                {/* Tombol Save */}
                <div className="mt-10">
                    <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-12 py-4 rounded-xl transition-colors shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>

      </main>
    </div>
  );
}

// Komponen NavItem (Sidebar)
function NavItem({ icon, label, active = false, onClick }: any) {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            active ? 'bg-orange-50 text-orange-500 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
}