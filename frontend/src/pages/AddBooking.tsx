import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Upload, Clock, Calendar as CalendarIcon
} from 'lucide-react';

export default function AddBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil data ruangan yang dikirim dari tombol "Book Now"
  // Default ke string kosong jika user akses langsung tanpa klik tombol
  const { roomName, floor } = location.state || { roomName: "", floor: "" };

  const [session, setSession] = useState("Pagi");

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate Logo" className="h-10 object-contain"/>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          {/* Menu Meeting Rooms tetap aktif karena ini sub-halamannya */}
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
        
        {/* Header Title */}
        <div className="bg-white p-6 rounded-t-xl shadow-sm border-b border-gray-100 mb-0.5">
             <h1 className="text-2xl font-bold text-gray-700">Add Booking</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-b-xl shadow-sm border border-gray-200">
            <form className="space-y-6 max-w-5xl">
                
                {/* Nama Pemohon */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Pemohon:<span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. John Doe" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>

                {/* Seksi */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Seksi:<span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. SIT" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>

                {/* Tanggal Meeting */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Meeting:<span className="text-red-500">*</span></label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="date" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600 bg-white" />
                    </div>
                </div>

                {/* Waktu Kegiatan (Toggle) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Kegiatan:<span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-200 rounded-lg p-1 max-w-full">
                        <button 
                            type="button"
                            onClick={() => setSession("Pagi")}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${session === "Pagi" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Pagi
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSession("Siang")}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${session === "Siang" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Siang
                        </button>
                    </div>
                </div>

                {/* Grid Waktu Mulai & Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Mulai:<span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input type="time" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Selesai:<span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input type="time" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Judul Kegiatan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Judul Kegiatan:<span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. Meeting bersama Vendor" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" />
                </div>

                {/* Lokasi & Nama Ruangan (Otomatis Terisi) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi Ruangan:<span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            defaultValue={floor} 
                            placeholder="e.g. Lantai 6"
                            readOnly 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Ruangan:<span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            defaultValue={roomName} 
                            placeholder="e.g. Cemara Room"
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none" 
                        />
                    </div>
                </div>

                {/* Catatan Tambahan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan (opsional):</label>
                    <textarea rows={4} placeholder="e.g. Type Message" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"></textarea>
                </div>

                {/* Upload File */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tambahkan file (opsional):</label>
                    <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <Upload size={20} className="text-gray-400 absolute left-4" />
                        <input 
                            type="file" 
                            className="w-full pl-8 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                    </div>
                </div>

                {/* Tombol Action */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="px-8 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        Submit Booking
                    </button>
                </div>

            </form>
        </div>

      </main>
    </div>
  );
}

// NavItem Reusable Component
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