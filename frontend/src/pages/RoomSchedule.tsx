import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Search, Pencil, Trash2, CheckCircle, Clock 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

export default function RoomSchedule() {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState("Schedule"); // 'Schedule' atau 'My Bookings'
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("User");

  // Cek Login
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (!savedName) navigate('/');
    setUsername(savedName || "User");
  }, [navigate]);

  // Data Dummy (Sesuai Desain)
  const scheduleData = [
    {
      id: 1,
      pemohon: "Safira",
      seksi: "SIT",
      tanggal: "Selasa, 2 Desember",
      sesi: "Pagi",
      waktu: "09:00-10:30 AM",
      judul: "Meeting bersama vendor",
      lokasi: "Lantai 6",
      ruangan: "Cemara Room",
      status: "Complete"
    },
    {
      id: 2,
      pemohon: "Sandra",
      seksi: "SIS",
      tanggal: "Selasa, 2 Desember",
      sesi: "Siang",
      waktu: "01:00-02:30 PM",
      judul: "Meeting bersama vendor",
      lokasi: "Lantai 7",
      ruangan: "Jati Room",
      status: "Pending"
    },
    {
      id: 3,
      pemohon: "Budi",
      seksi: "HC",
      tanggal: "Rabu, 3 Desember",
      sesi: "Sore",
      waktu: "03:00-05:00 PM",
      judul: "Evaluasi Kinerja",
      lokasi: "Lantai 8",
      ruangan: "Meranti Room",
      status: "Pending"
    }
  ];

  // Filter Data (Search)
  const filteredData = scheduleData.filter(item => 
    item.judul.toLowerCase().includes(search.toLowerCase()) ||
    item.pemohon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. SIDEBAR */}
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
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Room Schedule</h1>
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

        {/* TAB MENU (Schedule | My Bookings) */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm w-full md:w-1/2 mb-8 border border-gray-100">
            <button 
                onClick={() => setActiveTab("Schedule")}
                className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                    activeTab === "Schedule" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
            >
                Schedule
            </button>
            <button 
                onClick={() => setActiveTab("My Bookings")}
                className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                    activeTab === "My Bookings" ? "bg-white shadow-sm border border-gray-100 text-orange-500" : "text-gray-400 hover:text-gray-600"
                }`}
            >
                My Bookings
            </button>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6 relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search for your booking" 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-orange-500 text-white text-sm">
                            <th className="p-4 font-semibold rounded-tl-xl">No</th>
                            <th className="p-4 font-semibold">Nama Pemohon</th>
                            <th className="p-4 font-semibold">Seksi</th>
                            <th className="p-4 font-semibold">Tanggal Kegiatan</th>
                            <th className="p-4 font-semibold">Sesi Kegiatan</th>
                            <th className="p-4 font-semibold">Waktu Kegiatan</th>
                            <th className="p-4 font-semibold">Judul Kegiatan</th>
                            <th className="p-4 font-semibold">Lokasi Ruangan</th>
                            <th className="p-4 font-semibold">Nama Ruangan</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold rounded-tr-xl text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {filteredData.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{index + 1}</td>
                                <td className="p-4 font-medium">{item.pemohon}</td>
                                <td className="p-4 text-gray-500">{item.seksi}</td>
                                <td className="p-4">{item.tanggal}</td>
                                <td className="p-4">{item.sesi}</td>
                                <td className="p-4 font-mono text-xs">{item.waktu}</td>
                                <td className="p-4 max-w-xs truncate" title={item.judul}>{item.judul}</td>
                                <td className="p-4">{item.lokasi}</td>
                                <td className="p-4">{item.ruangan}</td>
                                <td className="p-4">
                                    {/* Logic Warna Status */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                        item.status === "Complete" 
                                        ? "bg-green-100 text-green-600" 
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                        {item.status === "Complete" ? "Complete" : "Pending"}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {/* Logic Tombol Action */}
                                    {item.status === "Pending" ? (
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                                                <Pencil size={16} />
                                            </button>
                                            <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {filteredData.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    Data tidak ditemukan
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

// Komponen NavItem
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