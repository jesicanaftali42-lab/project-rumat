import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Bell, User } from 'lucide-react';

export default function ListBooking() {
  const navigate = useNavigate();

  // Data Dummy (Nanti diganti data dari Database)
  const bookings = [
    { no: 1, nama: 'Safira', seksi: 'SIT', tanggal: 'Selasa, 2 Desember', sesi: 'Pagi', waktu: '09:00-10:30 AM', judul: 'Meeting bersama vendor', lokasi: 'Lantai 6', ruangan: 'Regular text column', status: 'Complete' },
    { no: 2, nama: 'Sandra', seksi: 'SIS', tanggal: 'Selasa, 2 Desember', sesi: 'Siang', waktu: '01:00-02:30 PM', judul: 'Meeting bersama vendor', lokasi: 'Lantai 7', ruangan: 'Regular text column', status: 'Booked' },
    { no: 3, nama: 'Sandra', seksi: 'SIS', tanggal: 'Rabu, 3 Desember', sesi: 'Siang', waktu: '01:00-02:30 PM', judul: 'Meeting bersama vendor', lokasi: 'Lantai 7', ruangan: 'Regular text column', status: 'Waiting Approval' },
  ];

  // Helper untuk warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-600';
      case 'Booked': return 'bg-orange-100 text-orange-600';
      case 'Waiting Approval': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* === HEADER === */}
      <header className="flex justify-between items-center py-4 px-8 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="h-10" />
           <div className="flex flex-col">
             <span className="text-xl font-bold text-blue-600">RuMate</span>
             <span className="text-xs text-gray-500">Admin</span>
           </div>
        </div>

        <h1 className="text-2xl font-bold flex-1 text-center mr-20">List Booking</h1>

        <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-blue-500">
               <Bell size={24} />
               <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-700">Katie Pena</p>
                    <p className="text-xs text-gray-500">Admin</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden">
                    <img src="/logo.png" alt="Profile" className="h-full w-full object-cover" />
                </div>
            </div>
        </div>
      </header>

      {/* === KONTEN === */}
      <main className="p-8 max-w-7xl mx-auto">
        
        {/* Tombol Back & Search Bar */}
        <div className="flex items-center gap-6 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={32} className="text-black" />
            </button>
            
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search for your booking" 
                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                />
            </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-semibold">
                        <th className="p-4">No</th>
                        <th className="p-4">Nama Pemohon</th>
                        <th className="p-4">Seksi</th>
                        <th className="p-4">Tanggal Kegiatan</th>
                        <th className="p-4">Sesi Kegiatan</th>
                        <th className="p-4">Waktu Kegiatan</th>
                        <th className="p-4">Judul Kegiatan</th>
                        <th className="p-4">Lokasi Ruangan</th>
                        <th className="p-4">Nama Ruangan</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                    {bookings.map((item) => (
                        <tr key={item.no} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-500 font-medium">{item.no}</td>
                            <td className="p-4 font-bold text-gray-800">{item.nama}</td>
                            <td className="p-4 text-gray-600">{item.seksi}</td>
                            <td className="p-4 text-gray-600">{item.tanggal}</td>
                            <td className="p-4 text-gray-600">{item.sesi}</td>
                            <td className="p-4 text-gray-600">{item.waktu}</td>
                            <td className="p-4 text-gray-400 text-xs max-w-[150px] leading-tight">{item.judul}</td>
                            <td className="p-4 text-gray-600">{item.lokasi}</td>
                            <td className="p-4 text-gray-400">{item.ruangan}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </main>
    </div>
  );
}