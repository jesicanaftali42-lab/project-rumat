import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Ambil data user dari local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { username: 'Admin' };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* === HEADER === */}
      <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RuMate Logo" className="h-10" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600">RuMate</span>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-700">{user.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* === KONTEN UTAMA === */}
      <main className="p-8">
        
        {/* 1. BARIS ATAS: KARTU STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Menunggu Diperiksa" count="3" icon={<Clock />} color="text-blue-500" />
          <StatCard title="Pesanan Ditolak" count="5" icon={<XCircle />} color="text-red-500" />
          <StatCard title="Pesanan Diterima" count="8" icon={<Briefcase />} color="text-green-500" />
          <StatCard title="Pesanan Selesai" count="20" icon={<CheckCircle />} color="text-orange-500" />
        </div>

        {/* 2. BARIS TENGAH: PIE CHART, GRAFIK KECIL, SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-lg">Division</h3>
                <button className="text-gray-400">⋮</button>
            </div>
            <div className="h-48 flex items-center justify-center">
               <div className="w-32 h-32 rounded-full border-8 border-blue-400 border-r-green-400 border-b-orange-300 border-l-red-400"></div>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span>SIT</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-300 rounded-full"></span>SHO</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span>SOM</span>
            </div>
          </div>

          {/* Grafik Batang Kecil (Pemesanan) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">2025</h3>
                <span className="text-xs font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Pemesanan</span>
             </div>
             <div className="h-40 flex items-end justify-between gap-2 px-2">
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-1/2"></div>
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-2/3"></div>
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-3/4"></div>
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-full"></div>
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-5/6"></div>
                <div className="w-1/6 bg-blue-400 rounded-t-sm h-1/3"></div>
             </div>
             <div className="flex justify-between mt-2 text-xs text-gray-400">
                 <span>Juli</span><span>Desember</span>
             </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-lg">Schedule</h3>
                <button className="text-gray-400">⋮</button>
            </div>
            <div className="space-y-4">
                <ScheduleItem room="Cemara Room" time="10:00 - 11:00 AM" tag="SIT" color="bg-green-100 text-green-700" />
                <ScheduleItem room="Mahoni Room" time="01:00 - 03:00 PM" tag="SHO" color="bg-orange-100 text-orange-700" />
                <ScheduleItem room="Jati Room" time="09:00 - 10:30 AM" tag="SOM" color="bg-red-100 text-red-700" />
            </div>
          </div>
        </div>

        {/* 3. BARIS BARU: GRAFIK BESAR (KIRI) & TOMBOL (KANAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Kiri: Grafik Meeting Room (Lebar ambil 2 kolom) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">2025 <span className="text-gray-400 font-normal">| Meeting Room Stats</span></h3>
                    <span className="text-xs font-bold text-orange-500 border-b-2 border-orange-500 pb-1">Meeting Room</span>
                </div>
                {/* Visualisasi Grafik Besar */}
                <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2 border-b border-gray-100">
                    <BarItem h="h-24" name="Cemara" />
                    <BarItem h="h-32" name="Akasia" />
                    <BarItem h="h-40" name="Mahoni" />
                    <BarItem h="h-44" name="Beringin" />
                    <BarItem h="h-20" name="Jati" />
                    <BarItem h="h-36" name="Pinus" />
                    <BarItem h="h-28" name="Angsana" />
                </div>
            </div>

            {/* Kanan: Dua Tombol Besar (Disusun ke bawah) */}
            <div className="flex flex-col gap-4">
                {/* Tombol List Booking (Orange) */}
                <button onClick={() => navigate('/list-booking')} className="flex-1 bg-orange-400 hover:bg-orange-500 text-white p-6 rounded-2xl shadow-md text-center transition flex flex-col items-center justify-center gap-3">
                    <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center">
                        <span className="text-3xl">📋</span>
                        
                    </div>
                    <span className="text-xl font-bold">List Booking</span>
                </button>

                {/* Tombol Request Booking (Biru) */}
                <button onClick={() => navigate('/request-booking')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-2xl shadow-md text-center transition flex flex-col items-center justify-center gap-3">
                    <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center">
                        <span className="text-3xl">✏️</span>
                    </div>
                    <span className="text-xl font-bold">Request Booking</span>
                </button>
            </div>
        </div>

        {/* 4. BARIS BAWAH: TABEL (Full Width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">No</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama Pemohon</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Seksi</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Waktu Kegiatan</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Lokasi Ruangan</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama Ruangan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    <tr className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">1</td>
                        <td className="p-4 font-bold text-gray-800">Safira</td>
                        <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">SIT</span></td>
                        <td className="p-4 text-gray-600">09:00 - 10:30 AM</td>
                        <td className="p-4 text-gray-600">Lantai 6</td>
                        <td className="p-4 text-gray-600">Pinus Room</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">2</td>
                        <td className="p-4 font-bold text-gray-800">Sandra</td>
                        <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">SIS</span></td>
                        <td className="p-4 text-gray-600">01:00 - 02:30 PM</td>
                        <td className="p-4 text-gray-600">Lantai 7</td>
                        <td className="p-4 text-gray-600">Cemara Room</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">3</td>
                        <td className="p-4 font-bold text-gray-800">Zahra Nina</td>
                        <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">SHO</span></td>
                        <td className="p-4 text-gray-600">01:00 - 02:30 PM</td>
                        <td className="p-4 text-gray-600">Lantai 7</td>
                        <td className="p-4 text-gray-600">Mahoni Room</td>
                    </tr>
                </tbody>
            </table>
        </div>

      </main>
    </div>
  );
}

// === KOMPONEN KECIL ===
function StatCard({ title, count, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h3 className="text-4xl font-bold text-gray-800 mb-1">{count}</h3>
                <p className="text-sm text-gray-500">{title}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text', 'bg')} ${color}`}>
                {icon}
            </div>
        </div>
    );
}

function ScheduleItem({ room, time, tag, color }: any) {
    return (
        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs ${color}`}>
                {tag}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm">{room}</h4>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}

function BarItem({ h, name }: any) {
    return (
        <div className="flex flex-col items-center gap-2 flex-1 group">
            <div className={`w-full ${h} bg-blue-400 rounded-t-lg group-hover:bg-blue-500 transition-all`}></div>
            <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{name}</span>
        </div>
    );
}