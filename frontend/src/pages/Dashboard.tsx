import { useState, useEffect, useRef } from 'react'; // 👈 1. Tambah useRef
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js'; // 👈 2. Import html2pdf
import { 
  LayoutGrid, 
  Users, 
  Calendar, 
  User, 
  LogOut, 
  Bell,
  CheckCircle,
  CalendarDays,
  Clock,
  XCircle,
  Loader2,
  MapPin,    // 👈 3. Tambahan Icon buat desain PDF
  Download,  // 👈 4. Tambahan Icon buat Tombol
  Edit,      // 👈 Tombol edit
  Trash2     // 👈 Tombol cancel/hapus
} from 'lucide-react'; 

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Referensi untuk desain PDF yang disembunyikan
  const ticketRef = useRef<HTMLDivElement>(null);

  // State User
  const [username, setUsername] = useState("User");
  const [role, setRole] = useState("Employee");
  const [division, setDivision] = useState("General");
  const [avatar, setAvatar] = useState("");

  // State Data Dashboard
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0, rejected: 0
  });
  const [todayMeetings, setTodayMeetings] = useState<any[]>([]);
  const [nextMeeting, setNextMeeting] = useState<any>(null);

  // --- 1. AMBIL DATA USER & BOOKING ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const userString = sessionStorage.getItem("user");
    if (!userString) { navigate('/'); return; }
    
    const userData = JSON.parse(userString);
    setUsername(userData.username || "User");
    setRole(userData.role || "Employee");
    setDivision(userData.division || userData.role || "General"); 
    setAvatar(userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`);
    
    const token = userData.access_token;

    try {
        const response = await axios.get('http://localhost:3000/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const allBookings = Array.isArray(response.data) ? response.data : response.data.data || [];

        const myBookings = allBookings.filter((b: any) => {
            if (b.user && b.user.username) {
                return b.user.username === userData.username;
            }
            return true; 
        });

        setStats({
            total: myBookings.length,
            approved: myBookings.filter((b: any) => b.status === 'APPROVED').length,
            pending: myBookings.filter((b: any) => b.status === 'PENDING' || !b.status).length,
            rejected: myBookings.filter((b: any) => b.status === 'REJECTED').length,
        });

        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`; 

        const todays = myBookings.filter((b: any) => 
            b.meetingDate === todayStr && (b.status === 'APPROVED' || !b.status)
        );
        setTodayMeetings(todays);

        const upcoming = myBookings
            .filter((b: any) => (b.status === 'APPROVED' || !b.status) && b.meetingDate >= todayStr)
            .sort((a: any, b: any) => {
                const timeA = new Date(`${a.meetingDate}T${a.startTime}`).getTime();
                const timeB = new Date(`${b.meetingDate}T${b.startTime}`).getTime();
                return timeA - timeB;
            });
        
        if (upcoming.length > 0) {
            setNextMeeting(upcoming[0]);
        }

    } catch (error) {
        console.error("Gagal ambil data dashboard:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleEditMeeting = (meeting: any) => {
    navigate('/add-booking', { state: { editData: meeting } });
  };

  const handleCancelMeeting = async (meeting: any) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    const userString = sessionStorage.getItem('user');
    const token = userString ? JSON.parse(userString).access_token : '';
    try {
      await axios.delete(`http://localhost:3000/bookings/${meeting.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
      alert('Booking dibatalkan.');
    } catch (error) {
      console.error('Gagal batalkan booking:', error);
      alert('Gagal membatalkan booking.');
    }
  };

  const formatTime = (time: string) => time ? time.substring(0, 5) : "-";

  // 🔥 5. FUNGSI DOWNLOAD PDF TIKET 🔥
  const handleDownloadPDF = () => {
    const element = ticketRef.current;
    if (!element) return;

    const opt = {
      margin:       0,
      filename:     `RuMate-Ticket-${nextMeeting?.id || 'Booking'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format:'a4', orientation: 'portrait' as const}
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800 relative">
      
      {/* 🔥 6. DESAIN TIKET DISEMBUNYIKAN DI SINI 🔥
        Kita atur position-nya agar berada jauh di luar layar (left: -9999px),
        supaya tidak merusak tampilan web, tapi tetap bisa dibaca oleh html2pdf.
      */}
      {nextMeeting && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          
          {/* 👇 PEMBUNGKUS KERTAS A4 (ref dipindah ke sini) 👇 */}
          <div 
            ref={ticketRef} 
            style={{ width: '210mm', height: '297mm' }} 
            className="bg-gray-100 flex items-center justify-center font-sans text-gray-800"
          >
             
             {/* 👇 KOTAK TIKET (Lebar disesuaikan, ada border radius melengkung) 👇 */}
             <div className="w-[360px] bg-slate-900 p-6 rounded-[2rem] shadow-2xl">
                 
                 {/* Header Logo */}
                 <div className="text-center mb-6 mt-4 flex flex-col items-center">
                     <img src="/logo.png" alt="RuMate Logo" className="h-12 mb-2" />
                     <p className="text-slate-400 text-xs tracking-widest uppercase">Official E-Ticket</p>
                 </div>

                 {/* Bodi Tiket */}
                 <div className="bg-white rounded-3xl overflow-hidden mb-4 shadow-xl">
                   <div className="bg-orange-500 p-6 text-center text-white relative">
                     <CheckCircle size={48} className="mx-auto mb-2 text-white/90" />
                     <h2 className="text-2xl font-black uppercase tracking-wide">Approved</h2>
                     <p className="text-orange-100 text-sm font-medium">Valid for entry</p>
                   </div>

                   <div className="border-b-2 border-dashed border-gray-200 mx-6"></div>

                   <div className="p-8 space-y-6">
                     <div className="text-center mb-6">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Event / Purpose</p>
                         <h3 className="text-xl font-black text-gray-800 leading-tight">{nextMeeting.meetingTitle || nextMeeting.purpose}</h3>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                         <div className="flex items-center gap-4">
                             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><MapPin size={20}/></div>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room</p>
                                 <p className="font-bold text-gray-900">{nextMeeting.room?.name}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><User size={20}/></div>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booked By</p>
                                 <p className="font-bold text-gray-900">{username}</p>
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-center gap-3">
                             <CalendarDays className="text-orange-500" size={24}/>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                 <p className="font-bold text-gray-900 text-sm">{nextMeeting.meetingDate}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <Clock className="text-orange-500" size={24}/>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</p>
                                 <p className="font-bold text-gray-900 text-sm">{formatTime(nextMeeting.startTime)}</p>
                             </div>
                         </div>
                     </div>
                   </div>

                   <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 font-medium">Booking Reference ID</p>
                      <p className="text-2xl font-mono tracking-[0.25em] text-gray-800 font-bold">#{String(nextMeeting.id).padStart(5, '0')}</p>
                   </div>
                 </div>
             </div>

          </div>
        </div>
      )}

      {/* === 1. SIDEBAR KIRI === */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-bold text-blue-600 tracking-tight"></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" active onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Users size={20} />} label="Meeting Rooms" onClick={() => navigate('/meeting-rooms')} />
          <NavItem icon={<Calendar size={20} />} label="Room Schedule" onClick={() => navigate('/room-schedule')} />
          <NavItem icon={<User size={20} />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors w-full px-4 py-2 rounded-lg">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* === 2. KONTEN UTAMA (KANAN) === */}
      <main className="flex-1 ml-64 p-8 md:p-12 bg-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">Hi {username} 👋</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here are your upcoming meetings and requests.</p>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="relative text-gray-400 hover:text-blue-600">
                <Bell size={24} />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold text-gray-900 capitalize">{username}</p>
                   <p className="text-xs text-blue-500 font-bold uppercase">{division}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden border border-gray-200">
                   <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                </div>
             </div>
          </div>
        </div>

        {/* LAYOUT GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- KOLOM KIRI (Menu & Status) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <QuickCard 
                   icon={<CalendarDays size={28} className="text-pink-500" />}
                   title="Room Schedule"
                   bg="bg-pink-50"
                   hover="hover:bg-pink-100"
                   onClick={() => navigate('/room-schedule')}
                />
                <QuickCard 
                   icon={<Users size={28} className="text-orange-500" />}
                   title="Meeting Rooms"
                   bg="bg-orange-50"
                   hover="hover:bg-orange-100"
                   onClick={() => navigate('/meeting-rooms')}
                />
                <QuickCard 
                   icon={<CheckCircle size={28} className="text-green-500" />}
                   title="My Bookings"
                   bg="bg-green-50"
                   hover="hover:bg-green-100"
                   onClick={() => navigate('/room-schedule', {state : {tab : 'My Bookings'}})} 
                />
              </div>
            </div>

            {/* STATUS CARDS */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Request Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <StatCard count={stats.total} label="Total Request" icon={<Users className="text-blue-600" size={24} />} bg="bg-blue-50" />
                    <StatCard count={stats.approved} label="Approved" icon={<CheckCircle className="text-indigo-600" size={24} />} bg="bg-indigo-50" />
                    <StatCard count={stats.pending} label="Pending Approval" icon={<Clock className="text-orange-600" size={24} />} bg="bg-orange-50" />
                    <StatCard count={stats.rejected} label="Rejected" icon={<XCircle className="text-red-600" size={24} />} bg="bg-red-50" />
                </div>
            </div>

            {/* List Meeting Hari Ini */}
            <div>
                <div className="flex justify-between items-center mb-4 mt-2">
                    <h3 className="font-bold text-lg">Today's Meetings</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-4 text-gray-400"><Loader2 className="animate-spin mx-auto"/> Loading...</div>
                    ) : todayMeetings.length === 0 ? (
                        <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
                            Tidak ada meeting hari ini.
                        </div>
                    ) : (
                        todayMeetings.map((meeting: any) => (
                            <div key={meeting.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                                <div>
                                  <h4 className="font-bold text-gray-800 text-sm">{meeting.meetingTitle || meeting.purpose}</h4>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock size={12}/> {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)} • {meeting.room?.name || "Room ID: " + meeting.roomId}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                    {meeting.user?.username || username}
                                  </span>

                                  {/* Action buttons: Edit (go to edit booking) and Cancel (delete) - shown for pending bookings */}
                                  <div className="flex items-center gap-2">
                                    <button aria-label={`Edit booking ${meeting.id}`} onClick={() => handleEditMeeting(meeting)} className="p-2 rounded-md hover:bg-gray-100 transition text-gray-600">
                                      <Edit size={16} />
                                    </button>
                                    {(meeting.status === 'PENDING' || !meeting.status) && (
                                      <button aria-label={`Cancel booking ${meeting.id}`} onClick={() => handleCancelMeeting(meeting)} className="p-2 rounded-md hover:bg-red-50 transition text-red-600">
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                        ))
                    )}
                </div>
            </div>

          </div>

          {/* --- KOLOM KANAN (Upcoming Meetings & PDF) --- */}
          <div>
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="bg-orange-400 p-5 text-center">
                   <h3 className="text-white font-bold text-lg">Upcoming Meeting</h3>
                </div>
                
                <div className="p-6 flex flex-col flex-1 justify-start">
                   {nextMeeting ? (
                       <>
                           <div className="w-full space-y-5 mb-8">
                             <div className="text-left border-b border-gray-100 pb-3">
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Meeting Title</p>
                                 <p className="font-bold text-gray-800 text-lg capitalize">{nextMeeting.meetingTitle || nextMeeting.purpose}</p>
                             </div>
                             <div className="text-left border-b border-gray-100 pb-3">
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Room</p>
                                 <p className="font-bold text-gray-800">{nextMeeting.room?.name || "Room ID: " + nextMeeting.roomId}</p>
                             </div>
                             <div className="text-left pb-3">
                                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date & Time</p>
                                 <p className="font-bold text-gray-800">
                                     {nextMeeting.meetingDate} <span className="text-gray-400 mx-1">|</span> {formatTime(nextMeeting.startTime)}
                                 </p>
                             </div>
                           </div>

                           {/* 🔥 7. TOMBOL DOWNLOAD PDF 🔥 */}
                           <button 
                             onClick={handleDownloadPDF} 
                             className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-200"
                           >
                             <Download size={20} />
                             Download Ticket PDF
                           </button>
                       </>
                   ) : (
                       <div className="text-gray-400 py-10">
                           <CalendarDays size={48} className="mx-auto mb-4 opacity-20"/>
                           <p>No upcoming approved meetings.</p>
                       </div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// === KOMPONEN KECIL (NAVITEM, QUICKCARD, STATCARD) ===
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all font-medium mb-1 ${
        active 
          ? 'text-orange-500 bg-orange-50 font-bold' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function QuickCard({ icon, title, bg, hover, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`${bg} ${hover} p-6 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-4 h-40 w-full group border border-transparent hover:border-gray-200`}
        >
            <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="font-bold text-gray-700 text-sm">{title}</span>
        </button>
    );
}

function StatCard({ count, label, icon, bg }: any) {
    return (
        <div className={`${bg} p-6 rounded-3xl flex items-center gap-5 border border-transparent hover:border-gray-200 transition`}>
            <div className="p-3 bg-white rounded-xl shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
        </div>
    );
}