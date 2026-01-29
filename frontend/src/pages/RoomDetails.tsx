import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  ArrowLeft, MapPin, Wifi, Monitor, Armchair, Mic, Coffee
} from 'lucide-react';

export default function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data dari halaman sebelumnya. Kalau tidak ada, pakai dummy default.
  const roomData = location.state?.room || {
    name: "Akasia Room",
    floor: "Lantai 6",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&fit=crop",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer luctus, justo et sollicitudin volutpat, mauris lectus placerat nibh, non consequat velit libero non massa."
  };

  // State untuk slot waktu (hanya visual saja)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Data Dummy Slot Waktu
  const morningSlots = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const afternoonSlots = ["01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR (Sama) --- */}
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
                <div className="w-full h-80 rounded-2xl overflow-hidden mb-6 shadow-sm">
                    <img src={roomData.image} alt={roomData.name} className="w-full h-full object-cover" />
                </div>

                {/* Judul & Deskripsi */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{roomData.name}</h1>
                <p className="text-gray-500 leading-relaxed mb-6 text-sm">
                    {roomData.desc || "Ruangan meeting modern dengan pencahayaan alami yang baik, cocok untuk presentasi dan diskusi tim. Dilengkapi dengan fasilitas telekonferensi terkini."}
                </p>

                {/* Info Lokasi & Kapasitas */}
                <div className="flex gap-8 mb-8 border-b border-gray-200 pb-8">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-gray-900" size={20} />
                        <span className="font-bold text-gray-700">{roomData.floor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users className="text-gray-900" size={20} />
                        <span className="font-bold text-gray-700">{roomData.capacity} Orang</span>
                    </div>
                </div>

                {/* Bagian Fasilitas (Sesuai Desain Grid) */}
                <h3 className="font-bold text-gray-900 mb-4">Facility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Konektivitas */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Konektivitas</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Wifi size={16} /> <span>Wi-Fi</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <span className="text-xs border border-gray-400 rounded px-1">USB</span> <span>Socket & USB Port</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Ruangan & Furnitur */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Ruangan & Furnitur</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Armchair size={16} /> <span>Kursi</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Monitor size={16} /> <span>Meja Meeting</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Coffee size={16} /> <span>AC / Ventilasi</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Presentasi */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-bold text-xs text-gray-500 mb-3 uppercase tracking-wider">Presentasi</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Monitor size={16} /> <span>TV / LCD Display</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Mic size={16} /> <span>Sound System</span>
                            </div>
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
                        <div className="bg-orange-400 text-white text-center py-1 rounded-md text-sm font-bold mb-3">
                            Pagi
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {morningSlots.map((time) => (
                                <button 
                                    key={time}
                                    onClick={() => setSelectedSlot(time)}
                                    className={`py-2 text-xs font-bold rounded border transition-all ${
                                        selectedSlot === time 
                                        ? "bg-orange-500 text-white border-orange-500" 
                                        : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bagian Siang */}
                    <div className="mb-6">
                        <div className="bg-orange-400 text-white text-center py-1 rounded-md text-sm font-bold mb-3">
                            Siang
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {afternoonSlots.map((time) => (
                                <button 
                                    key={time}
                                    onClick={() => setSelectedSlot(time)}
                                    className={`py-2 text-xs font-bold rounded border transition-all ${
                                        selectedSlot === time 
                                        ? "bg-orange-500 text-white border-orange-500" 
                                        : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note Kecil */}
                    <p className="text-[10px] text-gray-400 italic mb-6 leading-tight">
                        *Tidak ada batasan jumlah time slot yang dapat dipilih. Silakan pilih satu atau lebih waktu yang tersedia sesuai kebutuhan.
                    </p>

                    {/* Tombol Book Now */}
                    <button 
                        onClick={() => navigate('/add-booking', { 
                            state: { roomName: roomData.name, floor: roomData.floor } 
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