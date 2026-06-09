import { useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Mail, Shield, MapPin, Save, Phone, Briefcase, Camera 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE DATA PROFILE ---
  const [username, setUsername] = useState(""); // UNTUK HEADER (ID LOGIN)
  const [fullName, setFullName] = useState(""); // UNTUK FORM (NAMA LENGKAP)
  const [role, setRole] = useState(""); 
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // --- 1. AMBIL DATA SAAT LOAD ---
  useEffect(() => {
    fetchLatestProfile();
  }, []);

  const fetchLatestProfile = async () => {
    const userString = sessionStorage.getItem("user");
    if (!userString) {
        navigate('/');
        return;
    }
    
    const localData = JSON.parse(userString);
    const token = localData.access_token;
    const currentUserId = localData.id;

    // Set Tampilan Awal
    setUserId(currentUserId);
    // Pisahkan antara Username (Login) dan FullName (Tampilan)
    setUsername(localData.username || "User"); 
    setFullName(localData.fullName || ""); 
    setRole(localData.role || "Employee");
    
    try {
        const response = await axios.get(`http://localhost:3000/users/${currentUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const dbData = response.data;
        console.log("Data Terbaru dari DB:", dbData);

        // Update State
        setUsername(dbData.username || "User"); // Header tetap username asli
        setFullName(dbData.fullName || "");     // Form isi nama lengkap
        setEmail(dbData.email || "");
        setPhone(dbData.phone || "");
        setDivision(dbData.division || ""); 
        setLocation(dbData.officeLocation || "");
        
        // Avatar
        if (dbData.avatar && dbData.avatar.length > 20) {
            setAvatar(dbData.avatar);
        } else {
            setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${dbData.username}`);
        }

        // Update sessionStorage
        const updatedsessionStorage = { ...localData, ...dbData };
        sessionStorage.setItem("user", JSON.stringify(updatedsessionStorage));

    } catch (error) {
        console.error("Gagal ambil data terbaru, pakai data lokal:", error);
        setFullName(localData.fullName || "");
        setEmail(localData.email || "");
        setPhone(localData.phone || "");
        setDivision(localData.division || "");
        setLocation(localData.officeLocation || "");
        if (localData.avatar) setAvatar(localData.avatar);
        else setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${localData.username}`);
    }
  };

  // --- 2. FUNGSI UPLOAD FOTO ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File terlalu besar! Maksimal 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  // --- 3. FUNGSI SAVE ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const userString = sessionStorage.getItem("user");
        if (!userString || !userId) return;
        
        const userData = JSON.parse(userString);
        const token = userData.access_token;

        const payload = {
            fullName: fullName, // Kirim Nama Lengkap ke DB
            email: email,
            phone: phone,
            division: division,
            officeLocation: location,
            avatar: avatar
        };

        const response = await axios.patch(`http://localhost:3000/users/${userId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const updatedUser = { 
            ...userData, 
            ...response.data,
            fullName: response.data.fullName || fullName,
            division: response.data.division || division,
            officeLocation: response.data.officeLocation || location,
            phone: response.data.phone || phone,
            avatar: response.data.avatar || avatar
        };

        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        alert("✅ Profile Berhasil Disimpan Permanen!");
        window.location.reload(); 

    } catch (error: any) {
        console.error("Gagal update:", error);
        const errMsg = error.response?.data?.message || "Terjadi kesalahan server.";
        alert(`❌ Gagal menyimpan: ${errMsg}`);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="Logo" className="h-10 object-contain"/>
           <span className="text-xl font-bold text-blue-600"></span>
        </div>

        <nav className="flex-1 space-y-2">
           <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
           <NavItem icon={<Users size={20} />} label="Meeting Rooms" onClick={() => navigate('/meeting-rooms')} />
           <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
           <NavItem icon={<User size={20} />} label="Profile" active onClick={() => navigate('/profile')} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* 2. KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto">
        
        {/* HEADER PROFILE */}
        <div className="p-8 pb-0">
            {/* Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-blue-100 to-orange-50 rounded-3xl border border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <img src="/logo.png" className="w-64" alt="watermark"/>
                </div>
            </div>

            {/* Foto & Info Singkat */}
            <div className="flex items-end gap-6 px-8 -mt-16 relative z-10">
                <div className="relative group">
                    <div className="w-32 h-32 bg-white rounded-full p-1 shadow-md">
                        <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden border-4 border-white">
                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
                        title="Change Photo"
                    >
                        <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="mb-0">
                    {/* 🔥 INI YANG DIGANTI: TAMPILKAN USERNAME (LOGIN ID) */}
                    <h2 className="text-3xl font-bold text-gray-900 capitalize">{username}</h2>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide mt-1">
                        {role}
                    </span>
                </div>
            </div>
        </div>

        {/* FORM EDIT PROFILE */}
        <div className="p-8 pt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Profile Information</h3>
            
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl">
                    
                    {/* Full Name Input (Bisa Diedit) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Full Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={fullName} // Binding ke Full Name
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-medium capitalize" 
                                placeholder="Your Full Name"
                            />
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Email Address</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                                placeholder="name@company.com"
                            />
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Division</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={division}
                                onChange={(e) => setDivision(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                                placeholder="IT Department"
                            />
                            <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Phone</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                                placeholder="+62 8..."
                            />
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                            Role <span className="text-red-400 text-xs font-normal ml-1">(Cannot be edited)</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={role}
                                disabled 
                                className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 font-bold cursor-not-allowed select-none capitalize"
                            />
                            <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Office Location</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-4 pl-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                                placeholder="Medan Head Office"
                            />
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex gap-4">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-12 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving to Database...' : (
                            <>
                                <Save size={20} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>

      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
    return (
      <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-50 text-orange-500 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
        {icon}
        <span>{label}</span>
      </div>
    );
}