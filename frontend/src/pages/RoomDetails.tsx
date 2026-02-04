import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  ArrowLeft, MapPin, Wifi, Monitor, Armchair, Mic, Coffee, Loader2
} from 'lucide-react';

export default function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Ambil ID dari URL
  
  // State Data Ruangan
  const [room, setRoom] = useState<any>(location.state?.room || null);
  const [loading, setLoading] = useState(!location.state?.room); // Loading kalau data belum ada

  // State Slot Waktu (Masih Visual)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Data Dummy Slot Waktu
  const morningSlots = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const afternoonSlots = ["01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"];

  // --- FETCH DATA (JIKA AKSES LANGSUNG DARI URL) ---
  useEffect(() => {
    // Kalau room sudah ada dari state navigasi sebelumnya, gak usah fetch
    if (room) return; 

    const fetchRoomDetail = async () => {
        try {
            const userString = localStorage.getItem("user");
            const token = userString ? JSON.parse(userString).access_token : null;

            const response = await axios.get(`http://localhost:3000/rooms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Tambahkan gambar dummy jika dari DB belum ada gambar
            const dataWithImg = {
                ...response.data,
                image: response.data.image || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&fit=crop"
            };
            
            setRoom(dataWithImg);
        } catch (error) {
            console.error("Gagal ambil detail ruangan:", error);
            alert("Ruangan tidak ditemukan!");
            navigate('/meeting-rooms');
        } finally {
            setLoading(false);
        }
    };

    fetchRoomDetail();
  }, [id, room, navigate]);

  // --- LOGIC HELPER: MENGELOMPOKKAN FASILITAS ---
  // Database ngasih array ["Wifi", "AC", "TV"] -> Kita pecah ke kategori UI
  const categorizeFacility = (facilityList: string[]) => {
     const categories = {
        connectivity: [] as string[],
        furniture: [] as string[],
        presentation: [] as string[]
     };

     if (!facilityList) return categories;

     facilityList.forEach(item => {
        const lower = item.toLowerCase();
        if (lower.includes('wifi') || lower.includes('lan') || lower.includes('usb')) {
            categories.connectivity.push(item);
        } else if (lower.includes('tv') || lower.includes('lcd') || lower.includes('proyektor') || lower.includes('sound') || lower.includes('mic') || lower.includes('display')) {
            categories.presentation.push(item);
        } else {
            // Sisanya masuk ke furnitur/ruangan (AC, Kursi, Papan Tulis, dll)
            categories.furniture.push(item);
        }
     });

     return categories;
  }

  const facilities = room ? categorizeFacility(room.facilities) : null;

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">
              <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" size={40}/>
                  <p>Memuat Detail Ruangan...</p>
              </div>
          </div>
      );
  }

  if (!room) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
           <span className="text-xl font-bold text-blue-600">RuMate</span>
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

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Tombol Back */}
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold mb-6 transition-colors"
        >
            <ArrowLeft size={20} />
            <span>Go Back</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* KOLOM KIRI: Detail Ruangan */}
            <div className="flex-1">
                {/* Gambar Besar */}
<div className="w-full h-80 rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-200">
    <img 
        src={room.image || room.img || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&fit=crop"} 
        alt={room.name} 
        className="w-full h-full object-cover"
        // 👇 TAMBAHKAN INI (JURUS ANTI PECAH)
        onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&fit=crop"; // Gambar cadangan kalau error
        }}
    />
</div>

                {/* Judul & Deskripsi */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{room.name}</h1>
                <p className="text-gray-500 leading-relaxed mb-6 text-sm">
                    {room.desc || "Ruangan meeting modern dengan pencahayaan alami yang baik, cocok untuk presentasi dan diskusi tim. Dilengkapi dengan fasilitas pendukung produktivitas."}
                </p>

                {/* Info Lokasi & Kapasitas */}
                <div className="flex gap-8 mb-8 border-b border-gray-200 pb-8">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-gray-900" size={20} />
                        <span className="font-bold text-gray-700">Lantai {room.floor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users className="text-gray-900" size={20} />
                        <span className="font-bold text-gray-700">{room.capacity} Orang</span>
                    </div>
                </div>

                {/* Bagian Fasilitas (Dinamis dari DB) */}
                <h3 className="font-bold text-gray-900 mb-4">Facility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Card 1: Konektivitas */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Konektivitas</h4>
                        <div className="space-y-2">
                            {facilities?.connectivity.length ? facilities.connectivity.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Wifi size={16} /> <span>{item}</span>
                                </div>
                            )) : <span className="text-xs text-gray-400 italic">Tidak ada info</span>}
                        </div>
                    </div>

                    {/* Card 2: Ruangan & Furnitur */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Ruangan & Furnitur</h4>
                        <div className="space-y-2">
                            {facilities?.furniture.length ? facilities.furniture.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Armchair size={16} /> <span>{item}</span>
                                </div>
                            )) : <span className="text-xs text-gray-400 italic">Standard Room</span>}
                        </div>
                    </div>

                    {/* Card 3: Presentasi */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Presentasi</h4>
                        <div className="space-y-2">
                             {facilities?.presentation.length ? facilities.presentation.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Monitor size={16} /> <span>{item}</span>
                                </div>
                            )) : <span className="text-xs text-gray-400 italic">Tidak ada info</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: Available Time Slots */}
            <div className="w-full lg:w-96">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-6">Available Time Slots</h3>

                    {/* Bagian Pagi */}
                    <div className="mb-6">
                        <div className="bg-orange-400 text-white text-center py-1 rounded-md text-sm font-bold mb-3">Pagi</div>
                        <div className="grid grid-cols-4 gap-2">
                            {morningSlots.map((time) => (
                                <button key={time} onClick={() => setSelectedSlot(time)} className={`py-2 text-xs font-bold rounded border transition-all ${selectedSlot === time ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bagian Siang */}
                    <div className="mb-6">
                        <div className="bg-orange-400 text-white text-center py-1 rounded-md text-sm font-bold mb-3">Siang</div>
                        <div className="grid grid-cols-4 gap-2">
                            {afternoonSlots.map((time) => (
                                <button key={time} onClick={() => setSelectedSlot(time)} className={`py-2 text-xs font-bold rounded border transition-all ${selectedSlot === time ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"}`}>
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 italic mb-6 leading-tight">
                        *Jadwal di atas hanya estimasi. Pastikan ketersediaan saat melakukan booking.
                    </p>

                    {/* Tombol Book Now -> Arahkan ke form booking bawa data ID Ruangan */}
                    <button 
                        onClick={() => navigate('/add-booking', { 
                            state: { 
                                roomId: room.id,
                                roomName: room.name, 
                                floor: room.floor,
                                initialTime: selectedSlot 
                            } 
                        })}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-blue-200 shadow-lg"
                    >
                        Book Now
                    </button>

                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

// NavItem Reusable
function NavItem({ icon, label, active = false, onClick }: any) {
    return (
      <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-50 text-orange-500 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
        {icon}
        <span>{label}</span>
      </div>
    );
}