import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, Bell, QrCode, 
  FileText, CheckCircle, Clock, XCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [username, setUsername] = useState("User");
  const [role, setRole] = useState("User");

  // --- EFEK (Cek Login) ---
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (!savedName) {
        navigate('/'); // Kalau belum login, tendang ke depan
    } else {
        setUsername(savedName);
        setRole(savedRole || "User");
    }
  }, [navigate]);

  // --- LOGOUT ---
  const handleLogout = () => {
      localStorage.clear();
      navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR KIRI */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
        </div>

        {/* MENU NAVIGASI (SUDAH DIPERBAIKI) */}
        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={<LayoutGrid size={20} />} 
            label="Dashboard" 
            active 
            onClick={() => navigate('/dashboard')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Meeting Rooms" 
            onClick={() => navigate('/meeting-rooms')} 
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Room Schedule" 
            onClick={() => navigate('/room-schedule')}
            // Tambahkan onClick di sini nanti kalau halaman Schedule sudah jadi
          />
          <NavItem 
            icon={<User size={20} />} 
            label="Profile" 
            // Tambahkan onClick di sini nanti kalau halaman Profile sudah jadi
          />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* 2. KONTEN UTAMA (TENGAH) */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hi {username}</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here are your upcoming meetings.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 relative">
               <Bell size={20} className="text-gray-600" />
               <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-gray-900">{username}</p>
                 <p className="text-xs text-gray-500 capitalize">{role}</p>
               </div>
               <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Profile" />
               </div>
             </div>
          </div>
        </header>

        {/* Section 1: Today's Overview (3 Menu Utama) */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card color="bg-red-50" iconBg="bg-red-200" iconColor="text-red-500" title="Room Schedule" icon={<Calendar />} />
            <Card color="bg-orange-50" iconBg="bg-orange-200" iconColor="text-orange-600" title="Meeting Rooms" icon={<Users />} />
            <Card color="bg-green-50" iconBg="bg-green-200" iconColor="text-green-600" title="My Bookings" icon={<LayoutGrid />} />
          </div>
        </section>

        {/* Section 2: STATUS SUMMARY (4 Kotak Status) */}
        <section className="mb-8">
           <h2 className="text-xl font-bold text-blue-900 mb-4">Request Status</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatusCard 
                label="Total Request" count="1" icon={<FileText size={24} />} 
                color="bg-blue-50" iconColor="text-blue-600" iconBg="bg-blue-200"
              />
              <StatusCard 
                label="Approved" count="1" icon={<CheckCircle size={24} />} 
                color="bg-indigo-50" iconColor="text-indigo-600" iconBg="bg-indigo-200"
              />
              <StatusCard 
                label="Pending Approval" count="1" icon={<Clock size={24} />} 
                color="bg-orange-50" iconColor="text-orange-600" iconBg="bg-orange-200"
              />
              <StatusCard 
                label="Rejected" count="1" icon={<XCircle size={24} />} 
                color="bg-pink-50" iconColor="text-pink-600" iconBg="bg-pink-200"
              />
           </div>
        </section>

        {/* Section 3: Today's Meetings */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-900">Today's Meetings</h3>
             <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">Today, 25 Jan 2026</span>
           </div>
           <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
             <div>
               <h4 className="font-bold text-gray-800">Vendor Meeting (Jati Room)</h4>
               <p className="text-sm text-gray-500 mt-1">Today - 09.00 AM</p>
             </div>
             <button className="text-blue-500 text-sm font-bold hover:underline">View Details</button>
           </div>
        </section>
      </main>

      {/* 3. PANEL KANAN (WIDGET) */}
      <aside className="w-80 bg-white p-6 border-l border-gray-100 hidden xl:block">
        <div className="bg-orange-500 text-white rounded-t-2xl p-4 text-center font-bold">
          Upcoming Meetings
        </div>
        <div className="border border-t-0 border-orange-100 rounded-b-2xl p-6 shadow-sm mb-6">
           <h3 className="font-bold text-gray-800 mb-1">Vendor Discussion</h3>
           <p className="text-sm text-gray-500 mb-4">Room: Jati Room <br/> Time: 09:00 - 10:00 AM</p>
           
           <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
             <QrCode size={64} className="text-gray-800 mb-2" />
             <button className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
               View QR Code
             </button>
           </div>
        </div>
      </aside>

    </div>
  );
}

// --- KOMPONEN KECIL ---

// 1. Menu Sidebar (SUDAH UPDATE: Ada onClick)
function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
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

// 2. Card Menu Utama (Atas)
function Card({ color, iconBg, iconColor, title, icon }: any) {
  return (
    <div className={`${color} p-6 rounded-3xl flex flex-col items-center justify-center h-48 cursor-pointer hover:shadow-md transition-shadow`}>
       <div className={`${iconBg} ${iconColor} p-4 rounded-full mb-4`}>
         {icon}
       </div>
       <h3 className="font-bold text-gray-700">{title}</h3>
    </div>
  );
}

// 3. Status Card (4 Kotak Tengah)
function StatusCard({ label, count, icon, color, iconColor, iconBg }: any) {
  return (
    <div className={`${color} p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105 cursor-pointer`}>
      <div className={`${iconBg} ${iconColor} p-3 rounded-full flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-gray-800">{count}</h4>
      </div>
    </div>
  );
}