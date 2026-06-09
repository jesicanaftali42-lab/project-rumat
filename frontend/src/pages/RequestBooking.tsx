import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Users, Wifi, Monitor, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function RequestBooking() {
  const navigate = useNavigate();

  // --- STATE ---
  const [adminName, setAdminName] = useState("Admin");
  const [requests, setRequests] = useState<any[]>([]); // Data Asli
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const userString = sessionStorage.getItem('user');
    if (!userString) return navigate('/');
    
    const userData = JSON.parse(userString);
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        navigate('/dashboard'); return;
    }

    setAdminName(userData.username || "Admin");
    const token = userData.access_token;

    try {
        const response = await axios.get('http://localhost:3000/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter HANYA yang statusnya PENDING
        const pendingData = response.data
            .filter((b: any) => b.status === 'PENDING' || !b.status)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
        setRequests(pendingData);
    } catch (error) {
        console.error("Gagal load request:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- UPDATE STATUS (APPROVE / REJECT) ---
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const action = newStatus === 'APPROVED' ? "Menyetujui" : "Menolak";
    if(!window.confirm(`Yakin ingin ${action} request ini?`)) return;

    try {
        const userString = sessionStorage.getItem('user');
        const token = userString ? JSON.parse(userString).access_token : '';

        await axios.patch(`http://localhost:3000/bookings/${id}/status`, 
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Hapus item dari list lokal biar gak perlu fetch ulang (lebih smooth)
        setRequests(prev => prev.filter(req => req.id !== id));
        alert(`Berhasil ${newStatus === 'APPROVED' ? 'Approved' : 'Rejected'}!`);

    } catch (error) {
        alert("Gagal update status!");
    }
  };

  // Helper Format Jam
  const formatTime = (start: string, end: string) => {
      const s = start ? start.substring(0, 5) : "-";
      const e = end ? end.substring(0, 5) : "-";
      return `${s} - ${e}`;
  };

  // Gambar Dummy Random (Karena DB belum simpan gambar ruangan)
  const getRandomImage = (id: number) => {
      const images = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300&h=200',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=300&h=200',
        'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=300&h=200'
      ];
      return images[id % images.length];
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* === HEADER === */}
      <header className="bg-white flex justify-between items-center py-4 px-8 border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="h-10" />
           <div className="flex flex-col">
             <span className="text-xl font-bold text-blue-600"></span>
             <span className="text-xs text-gray-500">Admin</span>
           </div>
        </div>

        <h1 className="text-2xl font-bold flex-1 text-center mr-20">Request Booking</h1>

        <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-blue-500">
               <Bell size={24} />
               <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700 capitalize">{adminName}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminName}`} alt="Profile" className="h-full w-full object-cover" />
                </div>
            </div>
        </div>
      </header>

      {/* === KONTEN === */}
      <main className="p-8 max-w-6xl mx-auto">
        
        {/* Tombol Back */}
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white bg-transparent rounded-full transition">
                <ChevronLeft size={32} className="text-black" />
            </button>
        </div>

        {/* LIST REQUEST CARD */}
        <div className="space-y-6">
            {loading ? (
                <div className="text-center py-20 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2"/>Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Tidak ada request booking baru.</div>
            ) : (
                requests.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition">
                        
                        {/* GAMBAR RUANGAN */}
                        <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0 relative">
                            <img src={getRandomImage(item.id)} alt="Room" className="w-full h-full object-cover" />
                            {/* Overlay Tanggal (Opsional biar cantik) */}
                            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {item.meetingDate}
                            </div>
                        </div>

                        {/* DETAIL INFO */}
                        <div className="flex-1 w-full text-left">
                            {/* Badge Divisi */}
                            <span className={`px-3 py-1 rounded text-xs font-bold inline-block mb-2 uppercase ${['SIT', 'IT'].includes(item.user?.division) ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {item.user?.division || "N/A"}
                            </span>
                            
                            <h3 className="text-xl font-bold text-gray-900">{item.room?.name || "Unknown Room"}</h3>
                            <p className="text-gray-600 mb-1 font-medium capitalize">{item.user?.fullName || item.user?.username}</p>
                            <p className="text-gray-400 text-sm mb-4 italic">"{item.meetingTitle}"</p>
                            
                            {/* Fasilitas Icons (Static Dummy) */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1"><Users size={14}/> {item.room?.capacity || 20}</div>
                                <div className="flex items-center gap-1"><Wifi size={14}/> Wifi</div>
                                <div className="flex items-center gap-1"><Monitor size={14}/> Tv/ Led Display</div>
                            </div>
                        </div>

                        {/* KANAN: WAKTU & TOMBOL */}
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto min-w-[200px]">
                            <div className="text-right mb-4">
                                <p className="text-sm font-bold text-gray-800">{item.meetingDate}</p>
                                <p className="text-sm text-gray-500">{formatTime(item.startTime, item.endTime)}</p>
                            </div>
                            
                            <div className="flex gap-2 w-full">
                                <button 
                                    onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>

                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}