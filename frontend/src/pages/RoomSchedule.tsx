import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Search, ChevronLeft, ChevronRight, Filter, Loader2
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RoomSchedule() {
  const navigate = useNavigate();
  
  // State Utama
  const [activeTab, setActiveTab] = useState("Schedule");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("User");
  
  // DATA DARI DATABASE
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]); // <-- State buat nampung ruangan asli
  const [loading, setLoading] = useState(true);

  // State Timeline
  const [selectedFloor, setSelectedFloor] = useState<string | number>("All");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Gambar Dummy (Karena di DB gak ada gambar, kita putar-putar gambar ini)
  const dummyImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1517502884422-41e157d44301?auto=format&fit=crop&w=150&q=80',
  ];

  const timeSlots = [
    "07.00 am", "08.00 am", "09.00 am", "10.00 am", 
    "11.00 am", "12.00 pm", "01.00 pm", "02.00 pm", 
    "03.00 pm", "04.00 pm", "05.00 pm"
  ];

  // --- FETCH DATA (BOOKINGS & ROOMS) ---
  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const userString = localStorage.getItem("user");
    if (!userString) { navigate('/'); return; }
    const userData = JSON.parse(userString);
    setUsername(userData.username || "User");
    const token = userData.access_token;

    try {
        // 1. Ambil Booking
        const resBooking = await axios.get('http://localhost:3000/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(resBooking.data);

        // 2. Ambil Ruangan ASLI dari Database
        const resRooms = await axios.get('http://localhost:3000/rooms', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Tambahkan gambar random ke data ruangan
        const roomsWithImg = resRooms.data.map((room: any, index: number) => ({
            ...room,
            img: dummyImages[index % dummyImages.length] // Loop gambar biar gak kosong
        }));
        
        setRooms(roomsWithImg);

    } catch (error) {
        console.error("Gagal ambil data:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIC GANTI TANGGAL ---
  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // --- HELPER FUNCTIONS ---
  const formatTime = (isoString: string) => isoString ? isoString.substring(0, 5) : "-";

  const getBookingForCell = (roomId: number, timeLabel: string) => {
    let hour = parseInt(timeLabel.substring(0, 2));
    if (timeLabel.includes('pm') && hour !== 12) hour += 12; 
    
    // Format tanggal
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${month}-${day}`;

    return bookings.find(b => {
        const bookingHour = parseInt(b.startTime.split(':')[0]);
        // Pencocokan ID Ruangan, Jam, Tanggal, dan Status
        return b.room?.id === roomId && 
               bookingHour === hour && 
               b.meetingDate === selectedDateStr && 
               b.status === "APPROVED";
    });
  };

  // Filter My Bookings
  const myBookingList = bookings.filter(item => 
    item.user?.username === username && 
    (item.meetingTitle?.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter Ruangan Berdasarkan Lantai (Dropdown/Tab)
  const uniqueFloors = [...new Set(rooms.map(r => r.floor))].sort(); // Deteksi lantai otomatis
  
  const filteredRooms = selectedFloor === "All" 
    ? rooms 
    : rooms.filter(r => r.floor === selectedFloor);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="Logo" className="h-10 object-contain"/>
           <span className="text-xl font-bold text-blue-600">RuMate</span>
        </div>
        <nav className="flex-1 space-y-2">
           <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
           <NavItem icon={<Users size={20} />} label="Meeting Rooms" onClick={() => navigate('/meeting-rooms')} />
           <NavItem icon={<Calendar size={20} />} label="Room Schedule" active onClick={() => navigate('/room-schedule')} />
           <NavItem icon={<User size={20} />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>
        <button onClick={() => {localStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} /> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Room Schedule</h1>

        {/* TAB SWITCHER */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm w-full md:w-1/2 mb-8 border border-gray-100">
            <button onClick={() => setActiveTab("Schedule")} className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === "Schedule" ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600"}`}>Schedule</button>
            <button onClick={() => setActiveTab("My Bookings")} className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === "My Bookings" ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600"}`}>My Bookings</button>
        </div>

        {/* ================= TAB SCHEDULE ================= */}
        {activeTab === "Schedule" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                
                {/* FILTER LANTAI (OTOMATIS DARI DB) */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setSelectedFloor("All")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                            selectedFloor === "All" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        All Floors
                    </button>
                    {uniqueFloors.map(floor => (
                        <button 
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${
                                selectedFloor === floor ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                            Lantai {floor}
                        </button>
                    ))}
                </div>

                {/* DATE NAVIGATION */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <Calendar size={18}/>
                        <span className="text-sm font-bold">{bookings.length} Total Bookings</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevDate} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={24}/></button>
                        <span className="font-bold text-lg text-gray-900 w-48 text-center select-none">
                            {currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextDate} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight size={24}/></button>
                        <button onClick={handleToday} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Today</button>
                    </div>
                </div>

                {/* TIMELINE GRID TABLE */}
                <div className="overflow-x-auto pb-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2"/>Loading Rooms...</div>
                    ) : (
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-gray-100 w-24 text-left text-xs text-gray-400 font-bold uppercase sticky left-0 bg-white z-10">
                                        UTC +07:00
                                    </th>
                                    {filteredRooms.map(room => (
                                        <th key={room.id} className="p-2 border-b border-gray-100 min-w-[150px]">
                                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <img src={room.img} className="w-12 h-8 object-cover rounded" alt={room.name}/>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-700 leading-tight truncate w-24" title={room.name}>{room.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">Lantai {room.floor}</p>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((time, index) => (
                                    <tr key={index}>
                                        <td className="p-4 border-b border-gray-50 text-xs font-bold text-gray-500 align-top h-20 sticky left-0 bg-white z-10">
                                            {time}
                                        </td>
                                        {filteredRooms.map(room => {
                                            const booking = getBookingForCell(room.id, time);
                                            const colors = ["bg-purple-50 border-purple-200 text-purple-700", "bg-orange-50 border-orange-200 text-orange-700", "bg-blue-50 border-blue-200 text-blue-700"];
                                            const colorClass = booking ? colors[booking.id % colors.length] : "";

                                            return (
                                                <td key={room.id} className="p-1 border-b border-gray-50 border-l border-r border-gray-50 h-20 align-top relative">
                                                    {booking ? (
                                                        <div className={`w-full h-full rounded-lg border p-2 text-left shadow-sm ${colorClass} absolute top-1 left-1 right-1 bottom-1 overflow-hidden group hover:z-20 hover:h-auto hover:shadow-lg transition-all bg-opacity-95`}>
                                                            <p className="font-extrabold text-xs uppercase mb-1">
                                                                {booking.user?.role || "USER"}
                                                            </p>
                                                            <p className="text-[10px] opacity-80 font-medium">
                                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                            </p>
                                                            <p className="text-[10px] font-bold mt-1 truncate group-hover:whitespace-normal">
                                                                {booking.meetingTitle}
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}

        {/* ================= TAB MY BOOKINGS ================= */}
        {activeTab === "My Bookings" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-4 border-b border-gray-100 flex gap-2">
                    <Search className="text-gray-400" size={20}/>
                    <input type="text" placeholder="Search your booking..." className="outline-none text-sm w-full" value={search} onChange={(e)=>setSearch(e.target.value)} />
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-orange-500 text-white text-sm">
                            <tr>
                                <th className="p-4">No</th>
                                <th className="p-4">Nama Pemohon</th>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Waktu</th>
                                <th className="p-4">Judul</th>
                                <th className="p-4">Ruangan</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                             {myBookingList.length === 0 ? (
                                 <tr><td colSpan={7} className="p-6 text-center text-gray-400">Tidak ada booking saya.</td></tr>
                             ) : myBookingList.map((item, idx) => (
                                 <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                     <td className="p-4 font-bold">{idx + 1}</td>
                                     <td className="p-4">{item.user?.username}</td>
                                     <td className="p-4">{item.meetingDate}</td>
                                     <td className="p-4">{formatTime(item.startTime)} - {formatTime(item.endTime)}</td>
                                     <td className="p-4">{item.meetingTitle}</td>
                                     <td className="p-4">{item.room?.name}</td>
                                     <td className="p-4">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                             {item.status || "PENDING"}
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}

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