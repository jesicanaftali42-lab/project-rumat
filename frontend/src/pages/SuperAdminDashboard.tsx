import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutGrid, Users, Calendar, LogOut, 
  Settings, Server, Shield, ArrowRight, DoorOpen, X 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid 
} from 'recharts';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Super Admin");
  const [loading, setLoading] = useState(true);
  
  // 🔥 PERBAIKAN: Semua data (jumlah & data mentah) digabung biar 100% sinkron
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    activeAdmins: 0,
    usersData: [] as any[],
    roomsData: [] as any[],
    bookingsData: [] as any[]
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [modalData, setModalData] = useState<{ title: string, type: string, data: any[] } | null>(null);

  useEffect(() => {
    fetchSuperData();
  }, []);

  const fetchSuperData = async () => {
    const userString = sessionStorage.getItem('user');
    if (!userString) return navigate('/');
    
    const userData = JSON.parse(userString);
    if (userData.role !== 'super_admin') {
        navigate('/dashboard'); 
        return;
    }

    setAdminName(userData.username);
    const token = sessionStorage.getItem('token');

    try {
        const [usersRes, roomsRes, bookingsRes] = await Promise.all([
            axios.get('http://localhost:3000/users', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:3000/rooms', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:3000/bookings', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];
        const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : roomsRes.data.data || [];
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.data || [];

        // Update jumlah DAN simpan data asli sekaligus
        setStats({
            totalUsers: users.filter((u:any) => u.role === 'user').length,
            totalRooms: rooms.length,
            totalBookings: bookings.length,
            activeAdmins: users.filter((u: any) => u.role === 'admin' || u.role === 'super_admin').length,
            usersData: users,
            roomsData: rooms,
            bookingsData: bookings
        });

        setChartData([
            { name: 'Employees', count: users.filter((u: any) => u.role === 'employee' || u.role === 'user').length },
            { name: 'Admins', count: users.filter((u: any) => u.role === 'admin' || u.role === 'super_admin').length },
            { name: 'Rooms', count: rooms.length },
        ]);

    } catch (error) {
        console.error("Gagal load data super admin:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => { sessionStorage.clear(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen">
         <div className="flex items-center gap-2 mb-10 px-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield size={20} className="text-white"/>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block">RuMat</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Super Panel</span>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Main Menu</p>
            <NavItem icon={<LayoutGrid size={20} />} label="Overview" active onClick={() => navigate('/super-admin')} />
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Management</p>
            <NavItem icon={<Users size={20} />} label="Manage Users" onClick={() => navigate('/manage-users')} />
            <NavItem icon={<DoorOpen size={20} />} label="Manage Rooms" onClick={() => navigate('/manage-rooms')} />
          </div>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors mt-auto pt-6 border-t border-slate-800">
          <LogOut size={20} /> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
                <p className="text-gray-500 mt-1">Selamat datang kembali, Master {adminName}.</p>
            </div>
            <div className="flex gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{adminName}</p>
                    <p className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-tighter">SUPER ADMIN</p>
                </div>
            </div>
        </div>

        {/* STATISTIK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Total Users" 
                count={stats.totalUsers} 
                icon={<Users size={24} className="text-blue-600"/>} 
                bg="bg-blue-50"
                onClick={() => setModalData({ title: 
                    "All Users Data", 
                    type: 'user',
                    data: stats.usersData.filter((u:any) => u.role === "user") })} 
            />
            <StatCard 
                title="Total Rooms" 
                count={stats.totalRooms} 
                icon={<Server size={24} className="text-orange-600"/>} 
                bg="bg-orange-50"
                onClick={() => setModalData({ title: "All Rooms Data", type: 'room', data: stats.roomsData })} 
            />
            <StatCard 
                title="Active Admins" 
                count={stats.activeAdmins} 
                icon={<Shield size={24} className="text-purple-600"/>} 
                bg="bg-purple-50" 
                onClick={() => setModalData({ 
                    title: "Active Admins Data", 
                    type: 'user', 
                    data: stats.usersData.filter((u: any) => u.role === 'admin' || u.role === 'super_admin') 
                })}
            />
            <StatCard 
                title="Total Bookings" 
                count={stats.totalBookings} 
                icon={<Calendar size={24} className="text-green-600"/>} 
                bg="bg-green-50" 
                onClick={() => setModalData({ title: "All Bookings History", type: 'booking', data: stats.bookingsData })}
            />
        </div>

        {/* MANAGEMENT SHORTCUTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-blue-200 transition">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Users size={32} />
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded">CRUD ACCESS</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    <p className="text-gray-500 text-sm mt-2">
                        Tambah, edit, hapus, dan atur role pengguna (Employee, Admin, Super Admin) serta divisi mereka.
                    </p>
                </div>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => navigate('/manage-users')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        Manage Users <ArrowRight size={18}/>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-orange-200 transition">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                            <Server size={32} />
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded">CRUD ACCESS</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Room Management</h3>
                    <p className="text-gray-500 text-sm mt-2">
                        Kontrol penuh atas fasilitas ruangan. Tambah ruangan baru, update kapasitas, atau hapus ruangan.
                    </p>
                </div>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => navigate('/manage-rooms')} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                        Manage Rooms <ArrowRight size={18}/>
                    </button>
                </div>
            </div>
        </div>

        {/* DISTRIBUTION CHART & TIPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                {/* 🔥 PERBAIKAN: Judul dan deskripsi chart dihapus di sini 🔥 */}
                <div className="flex-1 w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold' }} 
                                dy={10}
                            />
                            <RechartsTooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                formatter={(value: any) => [`${value} Total`, 'Jumlah']} 
                            />
                            <Bar 
                                dataKey="count" 
                                radius={[8, 8, 0, 0]} 
                                barSize={60}
                                label={{ position: 'top', fill: '#0f172a', fontSize: 16, fontWeight: 900, dy: -10 }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#F97316'][index % 3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TIPS CARD */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden shadow-xl shadow-slate-200">
                <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                <Settings size={40} className="text-slate-500 mb-4" />
                <h3 className="font-bold text-xl mb-2">Super Admin Tips</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Sebagai Super Admin, Anda memiliki akses penuh. Perubahan pada User atau Ruangan akan berdampak langsung pada operasional sistem.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">System Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-green-400 text-sm tracking-tight">Operational</span>
                    </div>
                </div>
            </div>
        </div>

        {/* MODAL POPUP DINAMIS */}
        {modalData && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-in fade-in duration-200">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900">{modalData.title}</h3>
                        <button onClick={() => setModalData(null)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Content (Scrollable) */}
                    <div className="p-6 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 shadow-sm">
                                <tr>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">No</th>
                                    {modalData.type === 'user' && (
                                        <>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Name/Username</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Division</th>
                                        </>
                                    )}
                                    {modalData.type === 'room' && (
                                        <>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Room Name</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Capacity</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Floor</th>
                                        </>
                                    )}
                                    {modalData.type === 'booking' && (
                                        <>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Title</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Booked By</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                            <th className="p-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {modalData.data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm font-bold text-gray-500">{idx + 1}</td>
                                        
                                        {/* Tampilan untuk USER */}
                                        {modalData.type === 'user' && (
                                            <>
                                                <td className="p-3 text-sm font-medium capitalize">{item.username || item.fullName || "User"}</td>
                                                <td className="p-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : item.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.role || "User"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600 uppercase">{item.division || "-"}</td>
                                            </>
                                        )}

                                        {/* Tampilan untuk ROOM */}
                                        {modalData.type === 'room' && (
                                            <>
                                                <td className="p-3 text-sm font-bold">{item.name}</td>
                                                <td className="p-3 text-sm text-gray-600">{item.capacity} Pax</td>
                                                <td className="p-3 text-sm text-gray-600">Lantai {item.floor}</td>
                                            </>
                                        )}

                                        {/* Tampilan untuk BOOKING */}
                                        {modalData.type === 'booking' && (
                                            <>
                                                <td className="p-3 text-sm font-medium">{item.meetingTitle}</td>
                                                <td className="p-3 text-sm text-gray-600 capitalize">{item.user?.fullName || item.user?.username || "Unknown"}</td>
                                                <td className="p-3 text-sm text-gray-600">{item.meetingDate}</td>
                                                <td className="p-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-[10px] tracking-wider font-bold uppercase ${item.status === 'APPROVED' ? 'bg-green-100 text-green-600' : item.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {item.status || "PENDING"}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {modalData.data.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium">Tidak ada data ditemukan.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// === KOMPONEN UI ===
function NavItem({ icon, label, active = false, onClick }: any) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all font-medium ${
          active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {icon}
        <span className="text-sm">{label}</span>
      </button>
    );
}

function StatCard({ title, count, icon, bg, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:scale-[1.02] ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}`}
        >
            <div className={`p-4 rounded-xl ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">{count}</h3>
            </div>
        </div>
    )
}