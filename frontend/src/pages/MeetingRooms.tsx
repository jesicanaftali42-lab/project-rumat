import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Search, Filter, Wifi, Monitor, MoreHorizontal, MapPin 
} from 'lucide-react'; // Import Icon tambahan
import { useNavigate } from 'react-router-dom';

export default function MeetingRooms() {
  const navigate = useNavigate();
  
  // State untuk Tab Lantai & Search
  const [activeTab, setActiveTab] = useState("Lantai 6");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("User");

  // Ambil data user dari LocalStorage
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (!savedName) navigate('/'); // Kalau gak login, tendang keluar
    setUsername(savedName || "User");
  }, [navigate]);

  // Data Dummy Ruangan (Nanti ini diambil dari Backend)
  const rooms = [
    {
      id: 1,
      name: "Cemara Room",
      capacity: 20,
      floor: "Lantai 6",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000", // Gambar contoh
      facilities: ["Wifi", "Tv / Led Display"]
    },
    {
      id: 2,
      name: "Akasia Room",
      capacity: 30,
      floor: "Lantai 6",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000",
      facilities: ["Wifi", "Tv / Led Display"]
    },
    {
      id: 3,
      name: "Jati Room",
      capacity: 15,
      floor: "Lantai 7",
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1000",
      facilities: ["Wifi", "Projector"]
    }
  ];

  // Filter ruangan berdasarkan Tab Lantai & Search
  const filteredRooms = rooms.filter(room => 
    room.floor === activeTab && 
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR (Sama persis dengan Dashboard) */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
        </div>

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
                    onClick={() => navigate('/profile')}
                  />
                </nav>

        <button onClick={() => {localStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* 2. KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header & User Profile */}
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
            
            {/* Profil Mini di Kanan Atas */}
            <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                 <p className="text-sm font-bold text-gray-900">{username}</p>
                 <p className="text-xs text-gray-500">SIT</p>
               </div>
               <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Profile" />
               </div>
            </div>
        </header>

        {/* TAB LANTAI */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
            {["Lantai 6", "Lantai 7", "Lantai 8"].map((lantai) => (
                <button 
                    key={lantai}
                    onClick={() => setActiveTab(lantai)}
                    className={`pb-3 px-4 font-medium transition-all ${
                        activeTab === lantai 
                        ? "text-orange-500 border-b-2 border-orange-500" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {lantai}
                </button>
            ))}
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search for your booking" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                <span className="text-sm">Sort by: All</span>
                <Filter size={16} />
            </button>
        </div>

        {/* LIST RUANGAN (Card) */}
        <div className="space-y-6">
            {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        {/* Gambar Ruangan */}
                        <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Info Ruangan */}
                        <div className="flex-1 py-2">
                            <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">07 : 00 AM - 04.00 PM</p>

                            <div className="flex items-center gap-6 text-gray-500 text-sm mb-6">
                                <div className="flex items-center gap-2">
                                    <Users size={18} />
                                    <span>{room.capacity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wifi size={18} />
                                    <span>Wifi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Monitor size={18} />
                                    <span>TV / LED</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 cursor-pointer hover:text-blue-500">
                                    <span className="text-xs font-bold">More+</span>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex flex-col justify-end pb-2">
                            <button className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                                View Details
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <p>Tidak ada ruangan ditemukan di {activeTab}</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

// Komponen NavItem (Bisa diklik)
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