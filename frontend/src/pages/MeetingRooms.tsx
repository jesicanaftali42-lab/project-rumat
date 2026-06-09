import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Search, Filter, Wifi, Tv, MapPin, Check
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

// Definisikan tipe data sesuai Backend
interface Room {
  id: number;
  name: string;
  floor: number;
  capacity: number;
  facilities: string[];
  description?: string;
  image_url?: string; // 👈 Pastikan ini ada
}

export default function MeetingRooms() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeFloor, setActiveFloor] = useState("Lantai 6");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State User Profile
  const [username, setUsername] = useState("User");
  const [division, setDivision] = useState("Employee"); 
  
  // State Data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter Dropdown
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("Room Name (A-Z)"); 
  const filterRef = useRef<HTMLDivElement>(null); 

  // --- 1. CEK LOGIN & AMBIL DATA ---
  useEffect(() => {
    const userString = sessionStorage.getItem("user");
    if (!userString) { navigate('/'); return; }
    
    const userData = JSON.parse(userString);
    setUsername(userData.username || "User");
    setDivision(userData.division || "Employee");

    fetchRooms();

    const handleClickOutside = (event: any) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
            setShowFilter(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  // --- 2. AMBIL DATA ---
  const fetchRooms = async () => {
    try {
        const userString = sessionStorage.getItem("user");
        const token = userString ? JSON.parse(userString).access_token : '';
        // Endpoint ini harusnya sudah mengembalikan image_url (setelah fix service tadi)
        const response = await axios.get('http://localhost:3000/rooms', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dataAsli = Array.isArray(response.data) ? response.data : response.data.data;
        setRooms(dataAsli || []);
    } catch (error) {
        console.error("Gagal ambil ruangan:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- 3. FILTER & SORT LOGIC ---
  const getFilteredAndSortedRooms = () => {
      let result = rooms.filter(room => {
          const targetFloor = parseInt(activeFloor.split(" ")[1]); 
          const isFloorMatch = room.floor === targetFloor;
          const isSearchMatch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
          return isFloorMatch && isSearchMatch;
      });

      if (sortBy === "Room Name (A-Z)") {
          result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "Room Name (Z-A)") {
          result.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortBy === "Capacity") {
          result.sort((a, b) => b.capacity - a.capacity);
      } 

      return result;
  };

  const filteredRooms = getFilteredAndSortedRooms();

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
            <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
            <span className="text-xl font-bold text-blue-600"></span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Users size={20} />} label="Meeting Rooms" active onClick={() => navigate('/meeting-rooms')} /> 
          <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
          <NavItem icon={<User size={20} />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>
        <button onClick={() => {sessionStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} /> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Atas */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
                <p className="text-gray-500 text-sm mt-1">Book a room suitable for your team.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 capitalize">{username}</p>
                    <p className="text-xs text-blue-500 font-bold uppercase">{division}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-blue-200">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* TAB LANTAI */}
        <div className="flex gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
            {["Lantai 1", "Lantai 2", "Lantai 6", "Lantai 7", "Lantai 8"].map((lantai) => (
                <button 
                    key={lantai}
                    onClick={() => setActiveFloor(lantai)}
                    className={`pb-3 text-sm font-bold transition-all whitespace-nowrap ${
                        activeFloor === lantai 
                        ? "text-orange-500 border-b-2 border-orange-500" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                    {lantai}
                </button>
            ))}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex justify-between items-center mb-6 relative z-20">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for your booking" 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm transition"
                />
            </div>
            
            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm transition"
                >
                    <span>Sort by: {sortBy}</span>
                    <Filter size={14} />
                </button>

                {showFilter && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 p-2">
                        {["All", "Availability", "Capacity", "Room Name (A-Z)", "Room Name (Z-A)"].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { setSortBy(opt); setShowFilter(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex justify-between items-center transition"
                            >
                                {opt}
                                {sortBy === opt && <Check size={16} className="text-blue-600"/>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* LIST RUANGAN */}
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-20 text-gray-500">Memuat data ruangan...</div>
            ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition duration-300">
                        
                        {/* 🔥 GAMBAR RUANGAN DIPERBAIKI 🔥 */}
                        <div className="w-full md:w-64 h-40 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                            <img 
                                src={room.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"} 
                                alt={room.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"} // Fallback image
                            />
                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                <MapPin size={10} /> Lantai {room.floor}
                            </div>
                        </div>

                        {/* Detail Ruangan */}
                        <div className="flex-1 w-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                            <p className="text-sm text-gray-400 font-medium mb-4">07:00 AM - 05:00 PM</p>

                            <div className="flex items-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-blue-500" />
                                    <span>{room.capacity} Orang</span>
                                </div>
                                {room.facilities && room.facilities.map((fac, idx) => {
                                    if(fac.includes("Wifi")) return <div key={idx} className="flex items-center gap-2"><Wifi size={18} className="text-blue-500"/><span>Wifi</span></div>;
                                    if(fac.includes("TV") || fac.includes("Projector")) return <div key={idx} className="flex items-center gap-2"><Tv size={18} className="text-blue-500"/><span>Display</span></div>;
                                    return null;
                                })}
                                <div className="flex items-center gap-1 text-gray-900 font-bold cursor-pointer hover:text-orange-500">
                                    <span>More+</span>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="w-full md:w-auto flex justify-end gap-3">
                            <button 
                                onClick={() => navigate('/room-details', { state: { room: room } })}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-6 py-3 rounded-lg transition-colors"
                            >
                                View Details
                            </button>
                            <button 
                                onClick={() => navigate('/add-booking', { state: { roomName: room.name, roomId: room.id, floor: room.floor } })}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors uppercase shadow-lg shadow-blue-200"
                            >
                                BOOK NOW
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-medium">Tidak ada ruangan ditemukan di {activeFloor}</p>
                    <p className="text-xs text-gray-400 mt-2">Coba pilih lantai lain atau hubungi Admin.</p>
                </div>
            )}
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