import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, CheckCircle, Clock, XCircle, Briefcase, 
  Loader2, FileText, PlusSquare, MoreVertical, Calendar, X // 👈 Tambah icon X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip as BarTooltip, YAxis, CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  
  // Data Grafik & UI
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });
  const [pieData, setPieData] = useState<any[]>([]); 
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [roomUsageData, setRoomUsageData] = useState<any[]>([]);
  
  // Data List (Schedule & Table)
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]); 

  // 🔥 STATE BARU UNTUK POPUP MODAL 🔥
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [modalData, setModalData] = useState<{ title: string, status: string, data: any[] } | null>(null);

  // Warna Chart
  const PIE_COLORS = ['#4ADE80', '#FCD34D', '#F87171', '#60A5FA']; 

  // --- FETCH DATA ---
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
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

        const allData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        // Simpan data mentah untuk modal
        setRawBookings(allData);

        const sortedByNewest = [...allData].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // --- 1. SETUP DATA GRAFIK ---
        setStats({
            total: allData.length,
            pending: allData.filter((b: any) => b.status === 'PENDING').length,
            approved: allData.filter((b: any) => b.status === 'APPROVED').length,
            rejected: allData.filter((b: any) => b.status === 'REJECTED').length,
            completed: allData.filter((b: any) => b.status === 'DONE').length,
        });

        const divisionCounts: Record<string, number> = {};
        allData.forEach((b: any) => {
            const div = b.user?.division || "General";
            divisionCounts[div] = (divisionCounts[div] || 0) + 1;
        });
        setPieData(Object.keys(divisionCounts).map(key => ({ name: key, value: divisionCounts[key] })));

        const currentYear = new Date().getFullYear();
        const monthCounts = Array(12).fill(0);
        allData.forEach((b: any) => {
            const dateObj = new Date(b.meetingDate);
            if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() === currentYear) {
                monthCounts[dateObj.getMonth()] += 1;
            }
        });
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        setMonthlyData(months.map((m, i) => ({ name: m, pesanan: monthCounts[i] })));

        const roomCounts: Record<string, number> = {};
        allData.forEach((b: any) => {
            const roomName = b.room?.name ? b.room.name.split(" ")[0] : "Unknown";
            roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
        });
        setRoomUsageData(Object.keys(roomCounts)
            .map(key => ({ name: key, count: roomCounts[key] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7)
        );

        // --- 2. SCHEDULE LIST LOGIC ---
        const schedule = allData
            .filter((b: any) => b.status === 'APPROVED')
            .sort((a: any, b: any) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime())
            .slice(0, 5);
        
        setScheduleList(schedule);

        // --- 3. TABLE DATA LOGIC ---
        setTableData(sortedByNewest.slice(0, 10));

    } catch (error) {
        console.error("Gagal load data:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => { sessionStorage.clear(); navigate('/'); };
  const formatTime = (time: string) => time ? time.substring(0, 5) : "-";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RuMate" className="h-9" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600 tracking-tight"></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold capitalize text-gray-700">{adminName}</p>
            <p className="text-xs text-gray-400 font-medium">Administrator</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-6 relative">
        
        {/* ROW 1: STATS CARDS (DENGAN ONCLICK) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            count={stats.pending} 
            label="Menunggu diperiksa" 
            icon={<Clock size={20}/>} 
            color="text-blue-500"
            onClick={() => setModalData({
                title: "Menunggu Diperiksa (Pending)",
                status: "PENDING",
                data: rawBookings.filter(b => b.status === 'PENDING')
            })}
          />
          <StatCard 
            count={stats.rejected} 
            label="Pesanan Ditolak" 
            icon={<XCircle size={20}/>} 
            color="text-red-500" 
            onClick={() => setModalData({
                title: "Pesanan Ditolak (Rejected)",
                status: "REJECTED",
                data: rawBookings.filter(b => b.status === 'REJECTED')
            })}
          />
          <StatCard 
            count={stats.approved} 
            label="Pesanan Diterima" 
            icon={<Briefcase size={20}/>} 
            color="text-green-500" 
            onClick={() => setModalData({
                title: "Pesanan Diterima (Approved)",
                status: "APPROVED",
                data: rawBookings.filter(b => b.status === 'APPROVED')
            })}
          />
        </div>

        {/* ROW 2: DIVISION, MONTHLY CHART, SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[380px]">
          
          {/* 2.1 PIE CHART DIVISION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">Division</h3>
                    <p className="text-xs text-gray-400">Statistik</p>
                </div>
                <MoreVertical size={16} className="text-gray-400 cursor-pointer"/>
            </div>
            <div className="flex-1 min-h-[200px] relative">
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">Belum ada data.</div>
                )}
            </div>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: PIE_COLORS[index % PIE_COLORS.length]}}></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{entry.name}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* 2.2 BAR CHART MONTHLY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{new Date().getFullYear()}</h3>
                </div>
                <span className="text-xs font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Pemesanan</span>
             </div>
             <div className="flex-1 w-full pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} interval={0} />
                        <YAxis hide/>
                        <BarTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                        <Bar dataKey="pesanan" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 2.3 SCHEDULE LIST (Fixed Logic) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">Schedule</h3>
                <MoreVertical size={16} className="text-gray-400 cursor-pointer"/>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                {scheduleList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                        <Calendar size={32} className="mb-2 opacity-50"/>
                        <p>Tidak ada jadwal approved</p>
                    </div>
                ) : (
                    scheduleList.map((b, i) => (
                        <ScheduleItem 
                            key={i}
                            division={b.user?.division || "N/A"}
                            room={b.room?.name || "Room"}
                            date={b.meetingDate}
                            time={`${formatTime(b.startTime)} - ${formatTime(b.endTime)}`}
                            colorIndex={i}
                        />
                    ))
                )}
            </div>
          </div>
        </div>

        {/* ROW 3: MEETING ROOM USAGE CHART & BIG BUTTONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[350px]">
          
          {/* 3.1 BAR CHART: Meeting Room Usage (2 Kolom) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">2026</h3>
                </div>
                <span className="text-xs font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Meeting Room</span>
             </div>
             
             <div className="flex-1 w-full pl-0">
                {roomUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roomUsageData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 11, fill: '#6B7280', fontWeight: '500'}} 
                                dy={10}
                            />
                            <YAxis hide/>
                            <BarTooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                            />
                            <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Belum ada data pemakaian ruangan.</div>
                )}
             </div>
          </div>

          {/* 3.2 BIG ACTION BUTTONS (1 Kolom) */}
          <div className="flex flex-col gap-4 h-full">
            <button 
                onClick={() => navigate('/list-booking')}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white rounded-2xl shadow-md transition flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
            >
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText size={32} strokeWidth={2.5}/>
                </div>
                <span className="font-bold text-lg">List Booking</span>
            </button>

            <button 
                onClick={() => navigate('/request-booking')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md transition flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
            >
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <PlusSquare size={32} strokeWidth={2.5}/>
                </div>
                <span className="font-bold text-lg">Request Booking</span>
            </button>
          </div>

        </div>

        {/* ROW 4: TABLE RECENT ACTIVITY (Fixed Logic) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
                <span className="text-xs text-gray-400">10 Booking Terakhir</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">No</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Pemohon</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seksi</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pemesanan</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sesi Kegiatan</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Waktu Kegiatan</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Ruangan</th>
                            <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Ruangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
                        ) : tableData.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-xs">Belum ada data booking sama sekali.</td></tr>
                        ) : (
                            tableData.map((b, idx) => (
                                <tr key={b.id} className="hover:bg-gray-50 transition group">
                                    <td className="p-4 text-gray-500 font-medium">{idx + 1}</td>
                                    <td className="p-4 font-bold text-gray-800 text-xs capitalize">{b.user?.fullName || b.user?.username}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                            (b.user?.division === 'SIT') ? 'bg-green-200 text-green-800' :
                                            (b.user?.division === 'SIS') ? 'bg-blue-200 text-blue-800' :
                                            (b.user?.division === 'SHO') ? 'bg-orange-200 text-orange-800' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {b.user?.division || "N/A"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500 pl-6">{b.id}</td>
                                    <td className="p-4 text-xs text-gray-500 capitalize">{b.session || "Pagi"}</td>
                                    <td className="p-4 text-xs text-gray-500">{formatTime(b.startTime)} - {formatTime(b.endTime)}</td>
                                    <td className="p-4 text-xs text-gray-500">Lantai {b.room?.floor || "-"}</td>
                                    <td className="p-4 text-xs text-gray-500">{b.room?.name}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 🔥 POPUP MODAL UNTUK STAT CARD 🔥 */}
        {modalData && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col animate-in fade-in duration-200">
                    
                    {/* Header Modal */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{modalData.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                modalData.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                modalData.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {modalData.data.length} Data
                            </span>
                        </div>
                        <button onClick={() => setModalData(null)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Konten Modal (Tabel) */}
                    <div className="p-6 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 shadow-sm">
                                <tr>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">No</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ref ID</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pemohon</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Judul Meeting</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ruangan</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {modalData.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-gray-400 font-medium text-sm">
                                            Tidak ada data untuk status ini.
                                        </td>
                                    </tr>
                                ) : (
                                    modalData.data.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm font-bold text-gray-500">{idx + 1}</td>
                                            <td className="p-3">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono text-xs font-bold tracking-widest">
                                                    #{String(item.id).padStart(5, '0')}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm font-bold text-gray-800 capitalize">
                                                {item.user?.fullName || item.user?.username || "Unknown"}
                                                <span className="block text-[10px] font-medium text-gray-400 mt-0.5">{item.user?.division || "N/A"}</span>
                                            </td>
                                            <td className="p-3 text-sm font-medium text-gray-700 max-w-[200px] truncate" title={item.meetingTitle}>
                                                {item.meetingTitle}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">{item.room?.name || "Unknown"}</td>
                                            <td className="p-3 text-sm text-gray-600 whitespace-nowrap">{item.meetingDate}</td>
                                            <td className="p-3 text-sm text-gray-600 whitespace-nowrap">
                                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// === KOMPONEN UI HELPER ===

function StatCard({ count, label, icon, color, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02] ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
        >
            <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{count}</h3>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text', 'bg')} ${color}`}>
                {icon}
            </div>
        </div>
    );
}

function ScheduleItem({ division, room, date, time, colorIndex }: any) {
    const bgColors = ["bg-green-200 text-green-800", "bg-orange-200 text-orange-800", "bg-red-200 text-red-800", "bg-blue-200 text-blue-800"];
    const currentColor = bgColors[colorIndex % bgColors.length];

    return (
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition group cursor-default border-b border-gray-50 last:border-0">
            <div className={`w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold uppercase ${currentColor}`}>
                {division}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-xs truncate">{room}</h4>
                <p className="text-[10px] text-gray-400">{date}</p>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{time}</span>
            </div>
        </div>
    );
}