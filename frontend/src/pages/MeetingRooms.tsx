import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Search, Filter, Wifi, Tv
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; // 1. Pastikan ini di-import

export default function MeetingRooms() {
  const navigate = useNavigate(); // 2. Inisialisasi hook navigasi
  
  // --- STATE ---
  const [activeFloor, setActiveFloor] = useState("Lantai 6");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("User");

  // --- CEK LOGIN ---
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (!savedName) navigate('/');
    setUsername(savedName || "Jesica");
  }, [navigate]);

  // --- DATA DUMMY RUANGAN ---
  const roomsData = [
    // LANTAI 6
    { 
      id: 1, 
      name: "Cemara Room", 
      floor: "Lantai 6",
      time: "07:00 AM - 04:00 PM",
      capacity: 20,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&fit=crop",
      facilities: ["Wifi", "TV / LED"]
    },
    { 
      id: 2, 
      name: "Akasia Room", 
      floor: "Lantai 6",
      time: "07:00 AM - 04:00 PM",
      capacity: 30,
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&fit=crop",
      facilities: ["Wifi", "TV / LED"]
    },
    { 
      id: 5, 
      name: "Beringin Room", 
      floor: "Lantai 6",
      time: "07:00 AM - 04:00 PM",
      capacity: 10,
      image: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=400&fit=crop",
      facilities: ["Wifi", "TV / LED"]
    },
    // LANTAI 7
    { 
      id: 3, 
      name: "Mahoni Room", 
      floor: "Lantai 7",
      time: "07:00 AM - 04:00 PM",
      capacity: 15,
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&fit=crop",
      facilities: ["Wifi", "TV / LED"]
    },
    // LANTAI 8
    { 
      id: 4, 
      name: "Meeting Room 8", 
      floor: "Lantai 8",
      time: "07:00 AM - 04:00 PM",
      capacity: 50,
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&fit=crop",
      facilities: ["Wifi", "TV / LED"]
    },
  ];

  // --- FILTER LOGIC ---
  const filteredRooms = roomsData.filter(room => 
    room.floor === activeFloor && 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Users size={20} />} label="Meeting Rooms" active onClick={() => navigate('/meeting-rooms')} /> 
          <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
          <NavItem icon={<User size={20} />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>

        <button onClick={() => {localStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* 2. KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Atas */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500">SIT</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                    <img src="https://i.pravatar.cc/150?u=jesica" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* TAB LANTAI */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
            {["Lantai 6", "Lantai 7", "Lantai 8"].map((lantai) => (
                <button 
                    key={lantai}
                    onClick={() => setActiveFloor(lantai)}
                    className={`pb-3 text-sm font-bold transition-all ${
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
        <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for your booking" 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
                />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm">
                <span>Sort by: Room Name (Z-A)</span>
                <Filter size={14} />
            </button>
        </div>

        {/* LIST RUANGAN (CARDS) */}
        <div className="space-y-4">
            {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                        {/* Gambar Ruangan */}
                        <div className="w-full md:w-64 h-40 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Detail Ruangan */}
                        <div className="flex-1 w-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                            <p className="text-sm text-gray-400 font-medium mb-4">{room.time}</p>

                            {/* Fasilitas Icons */}
                            <div className="flex items-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users size={18} />
                                    <span>{room.capacity}</span>
                                </div>
                                {room.facilities.includes("Wifi") && (
                                    <div className="flex items-center gap-2">
                                        <Wifi size={18} />
                                        <span>Wifi</span>
                                    </div>
                                )}
                                {room.facilities.includes("TV / LED") && (
                                    <div className="flex items-center gap-2">
                                        <Tv size={18} />
                                        <span>Tv / Led Display</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-gray-900 font-bold cursor-pointer hover:text-orange-500">
                                    <span>More+</span>
                                </div>
                            </div>
                        </div>

                        {/* --- BAGIAN TOMBOL --- */}
                        <div className="w-full md:w-auto flex justify-end gap-3">
                            {/* Tombol View Details */}
                            <button 
                                onClick={() => navigate('/room-details', { 
                                    state: { room: room } // <-- Kirim seluruh object 'room'
                                })}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-6 py-3 rounded-lg transition-colors"
                            >
                                View Details
                            </button>
                            
                            {/* TOMBOL YANG DI-UPDATE: KIRIM DATA KE HALAMAN ADD BOOKING */}
                            <button 
                                onClick={() => navigate('/add-booking', { 
                                    state: { 
                                        roomName: room.name, 
                                        floor: room.floor 
                                    } 
                                })}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors uppercase"
                            >
                                BOOK NOW
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <p>Tidak ada ruangan ditemukan di {activeFloor}</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

// --- Komponen NavItem ---
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