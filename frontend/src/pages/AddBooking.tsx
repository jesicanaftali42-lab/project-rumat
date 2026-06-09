import { useState, useEffect, useRef } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutGrid, Users, Calendar, User, LogOut, 
  Upload, Clock, ChevronLeft, CheckCircle, XCircle 
} from 'lucide-react'; 

export default function AddBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. TANGKAP DATA RUANGAN DARI MEETING ROOMS ATAU EDIT DATA DARI SCHEDULE
  const { roomId, roomName, floor } = location.state || {};
  const editData = location.state?.editData; // Data jika mode EDIT

  // --- STATE FORM ---
  const [applicantName, setApplicantName] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState(editData?.meetingDate || "");
  const [startTime, setStartTime] = useState(editData?.startTime ? editData.startTime.substring(0,5) : "");
  const [endTime, setEndTime] = useState(editData?.endTime ? editData.endTime.substring(0,5) : "");
  const [title, setTitle] = useState(editData?.meetingTitle || "");
  const [notes, setNotes] = useState(editData?.notes || "");
  
  const currentRoomId = editData?.room?.id || roomId;
  const currentRoomName = editData?.room?.name || roomName;
  const currentFloor = editData?.room?.floor || floor;

  const [loading, setLoading] = useState(false);
  
  // STATE FILE
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef<HTMLInputElement>(null); 

  // STATE MODAL (POPUP)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // --- CEK LOGIN & DATA RUANGAN ---
  useEffect(() => {
    const userString = sessionStorage.getItem("user");
    if (!userString) { navigate('/'); return; }
    const userData = JSON.parse(userString);
    setApplicantName(userData.username || "");
    setSection(userData.role || "SIT");

    if (!currentRoomId) {
        alert("Pilih ruangan dulu dari menu Meeting Rooms!");
        navigate('/meeting-rooms');
    }
  }, [currentRoomId, navigate]);

  // --- FUNGSI FILE ---
  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFileName(file.name);
  };

  // --- FUNGSI SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userString = sessionStorage.getItem('user');
      const token = userString ? JSON.parse(userString).access_token : null;

      if (startTime >= endTime) {
        alert("Jam selesai harus lebih akhir dari jam mulai!");
        setLoading(false);
        return;
      }

      const payload = {
        roomId: Number(currentRoomId),
        meetingTitle: title,
        meetingDate: date,
        startTime: startTime,
        endTime: endTime,
        description: notes + (fileName !== "No file chosen" ? ` [Lampiran: ${fileName}]` : ""),
      };

      console.log("Mengirim Data:", payload);

      if (editData) {
          await axios.delete(`http://localhost:3000/bookings/${editData.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
      }

      await axios.post('http://localhost:3000/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // BERHASIL -> TAMPILKAN MODAL SUKSES
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Gagal Booking:", error);
      // GAGAL (Tabrakan Jadwal dll) -> TAMPILKAN MODAL ERROR
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // --- TOMBOL DI MODAL ERROR ---
  const handleRetryTime = () => {
      setShowErrorModal(false);
      setStartTime(""); // Kosongkan jam mulai
      setEndTime("");   // Kosongkan jam selesai
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 relative">
      
      {/* --- MODAL SUKSES --- */}
      {showSuccessModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 w-[400px] text-center shadow-2xl flex flex-col items-center">
                  <div className="w-20 h-20 mb-4">
                      {/* Icon Kalender Hijau */}
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" className="text-green-500 stroke-[3px]" />
                      </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Diterima</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
                      Selamat! Pesanan kamu untuk <span className="font-bold text-black">{currentRoomName}</span> telah diterima oleh pihak Rumat.
                  </p>
                  <button 
                      onClick={() => navigate('/room-schedule')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-200"
                  >
                      Kembali
                  </button>
              </div>
          </div>
      )}

      {/* --- MODAL ERROR (CONFLICT) --- */}
      {showErrorModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 w-[400px] text-center shadow-2xl flex flex-col items-center">
                  <div className="w-20 h-20 mb-4 relative">
                      {/* Icon Kalender Merah */}
                      <Calendar className="w-full h-full text-red-500" strokeWidth={1.5} />
                      <div className="absolute bottom-0 right-0 bg-white rounded-full">
                          <XCircle className="w-8 h-8 text-red-600 fill-white" />
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Ditolak</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
                      Pesanan kamu untuk <span className="font-bold text-black">{currentRoomName}</span> ditolak oleh pihak Rumat karena slot tersebut sudah diambil pengguna lain.
                  </p>
                  <div className="flex gap-3 w-full">
                      <button 
                          onClick={() => navigate('/meeting-rooms')}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
                      >
                          Kembali
                      </button>
                      <button 
                          onClick={handleRetryTime}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200"
                      >
                          Pilih jam lain
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
           <img src="/logo.png" alt="RuMate" className="h-10 object-contain"/>
           <span className="text-xl font-bold text-blue-600"></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Users size={20} />} label="Meeting Rooms" active onClick={() => navigate('/meeting-rooms')} /> 
          <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
          <NavItem icon={<User size={20} />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>

        <button onClick={() => {sessionStorage.clear(); navigate('/')}} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <ChevronLeft size={28} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{editData ? "Edit Booking" : "Add Booking"}</h1>
        </div>

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
                        readOnly 
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
                        readOnly 
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

                {/* Grid Waktu - Bagian Tombol Pagi/Siang dihapus */}
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
                        <input type="text" value={currentFloor ? `Lantai ${currentFloor}` : "Lantai -"} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Ruangan:<span className="text-red-500">*</span></label>
                        <input type="text" value={currentRoomName || "Ruangan -"} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                </div>

                {/* Catatan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan (opsional):</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none" placeholder="e.g. Butuh tambahan kursi..."></textarea>
                </div>

                {/* Upload File */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tambahkan file (opsional):</label>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                    />

                    <div className="flex items-center gap-4 border border-gray-300 rounded-lg p-2 bg-white">
                        <button 
                            type="button" 
                            onClick={handleFileClick} 
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-md hover:bg-orange-100 transition"
                        >
                            <Upload size={16} /> Choose File
                        </button>
                        <span className="text-gray-400 text-sm">{fileName}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 mt-6">
                    <button type="button" onClick={() => navigate('/room-schedule')} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition disabled:bg-gray-400">
                        {loading ? 'Processing...' : (editData ? 'Update Booking' : 'Submit Booking')}
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