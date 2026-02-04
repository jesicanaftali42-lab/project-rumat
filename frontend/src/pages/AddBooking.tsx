import { useState, useEffect, useRef } from 'react'; // Tambah useRef
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Upload, Clock 
} from 'lucide-react'; 

export default function AddBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. TANGKAP DATA RUANGAN
  const { roomId, roomName, floor } = location.state || {};

  // --- STATE ---
  const [applicantName, setApplicantName] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState("");
  const [session, setSession] = useState("Pagi");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  // STATE BARU: Untuk File Upload
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef<HTMLInputElement>(null); // Referensi ke input rahasia

  // --- CEK LOGIN & DATA RUANGAN ---
  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
        navigate('/');
        return;
    }
    const userData = JSON.parse(userString);
    setApplicantName(userData.username || "");
    setSection(userData.role || "SIT");

    if (!roomId) {
        alert("Pilih ruangan dulu dari menu Meeting Rooms!");
        navigate('/meeting-rooms');
    }
  }, [roomId, navigate]);

  // --- FUNGSI PILIH FILE ---
  const handleFileClick = () => {
    // Suruh input rahasia yang diklik
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setFileName(file.name); // Ubah teks jadi nama file
    }
  };

  // --- FUNGSI SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userString = localStorage.getItem('user');
      const token = userString ? JSON.parse(userString).access_token : null;

      if (startTime >= endTime) {
        alert("Jam selesai harus lebih akhir dari jam mulai!");
        setLoading(false);
        return;
      }

      // Payload JSON (File belum dikirim ke backend karena backend minta JSON)
      const payload = {
        roomId: Number(roomId),
        meetingTitle: title,
        meetingDate: date,
        startTime: startTime,
        endTime: endTime,
        description: notes + (fileName !== "No file chosen" ? ` [Lampiran: ${fileName}]` : "") 
      };

      console.log("Mengirim Data:", payload);

      await axios.post('http://localhost:3000/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Booking Berhasil Disimpan!");
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Gagal Booking:", error);
      const pesan = error.response?.data?.message;
      const textError = Array.isArray(pesan) ? pesan.join('\n') : (pesan || "Terjadi kesalahan server");
      alert("Gagal: \n" + textError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate" className="h-10 object-contain"/>
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

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Booking</h1>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nama Pemohon */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Pemohon:<span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                    />
                </div>

                {/* Seksi */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Seksi:<span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                    />
                </div>

                {/* Tanggal Meeting */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Meeting:<span className="text-red-500">*</span></label>
                    <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                </div>

                {/* Waktu Kegiatan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Kegiatan:<span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button type="button" onClick={() => setSession("Pagi")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${session === "Pagi" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>Pagi</button>
                        <button type="button" onClick={() => setSession("Siang")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${session === "Siang" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>Siang</button>
                    </div>
                </div>

                {/* Grid Waktu */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Mulai:<span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                            <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Selesai:<span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                            <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                </div>

                {/* Judul Kegiatan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Judul Kegiatan:<span className="text-red-500">*</span></label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="e.g. Meeting bersama Vendor" />
                </div>

                {/* Grid Lokasi (Read Only) */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi Ruangan:<span className="text-red-500">*</span></label>
                        <input type="text" value={floor ? `Lantai ${floor}` : "Lantai -"} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Ruangan:<span className="text-red-500">*</span></label>
                        <input type="text" value={roomName || "Ruangan -"} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                </div>

                {/* Catatan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan (opsional):</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none" placeholder="e.g. Butuh tambahan kursi..."></textarea>
                </div>

                {/* Upload File (SEKARANG SUDAH JALAN) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tambahkan file (opsional):</label>
                    
                    {/* Input Rahasia (Gak Kelihatan) */}
                    <input 
                        type="file" 
                        ref={fileInputRef} // Sambungkan ke ref
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />

                    {/* Tombol Palsu yang bisa dipencet */}
                    <div className="flex items-center gap-4 border border-gray-300 rounded-lg p-2 bg-white">
                        <button 
                            type="button" 
                            onClick={handleFileClick} // Panggil fungsi klik
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-md hover:bg-orange-100 transition"
                        >
                            <Upload size={16} /> Choose File
                        </button>
                        <span className="text-gray-400 text-sm">{fileName}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-6">
                    <button type="button" onClick={() => navigate('/meeting-rooms')} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition disabled:bg-gray-400">
                        {loading ? 'Sending...' : 'Submit Booking'}
                    </button>
                </div>

            </form>
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