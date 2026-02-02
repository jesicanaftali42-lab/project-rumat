import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Users, Wifi, Monitor, Check, X } from 'lucide-react';

export default function RequestBooking() {
  const navigate = useNavigate();

  // Data Dummy (Pura-pura data dari Database)
  const requests = [
    { 
      id: 1, 
      room: 'Mahoni Room', 
      requester: 'Zara Fania', 
      division: 'SIT', 
      date: 'Selasa, 2 Desember 2025', 
      time: '03:00 - 04:00 PM', 
      capacity: 20,
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300&h=200' // Gambar contoh
    },
    { 
      id: 2, 
      room: 'Mahoni Room', 
      requester: 'Vanya Andrea', 
      division: 'SHO', 
      date: 'Selasa, 2 Desember 2025', 
      time: '03:00 - 04:00 PM', 
      capacity: 20,
      img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=300&h=200' // Gambar contoh
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* === HEADER === */}
      <header className="bg-white flex justify-between items-center py-4 px-8 border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="h-10" />
           <div className="flex flex-col">
             <span className="text-xl font-bold text-blue-600">RuMate</span>
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
      <main className="p-8 max-w-6xl mx-auto">
        
        {/* Tombol Back */}
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white bg-transparent rounded-full transition">
                <ChevronLeft size={32} className="text-black" />
            </button>
        </div>

        {/* LIST REQUEST CARD */}
        <div className="space-y-6">
            {requests.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                    
                    {/* GAMBAR RUANGAN */}
                    <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.img} alt="Room" className="w-full h-full object-cover" />
                    </div>

                    {/* DETAIL INFO */}
                    <div className="flex-1 w-full">
                        {/* Badge Divisi */}
                        <span className={`px-3 py-1 rounded text-xs font-bold inline-block mb-2 ${item.division === 'SIT' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.division}
                        </span>
                        
                        <h3 className="text-xl font-bold text-gray-900">{item.room}</h3>
                        <p className="text-gray-600 mb-4">{item.requester}</p>
                        
                        {/* Fasilitas Icons */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1"><Users size={14}/> {item.capacity}</div>
                            <div className="flex items-center gap-1"><Wifi size={14}/> Wifi</div>
                            <div className="flex items-center gap-1"><Monitor size={14}/> Tv/ Led Display</div>
                        </div>
                    </div>

                    {/* KANAN: WAKTU & TOMBOL */}
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto min-w-[200px]">
                        <div className="text-right mb-4">
                            <p className="text-sm font-bold text-gray-800">{item.date}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
                        </div>
                        
                        <div className="flex gap-2 w-full">
                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2">
                                Approve
                            </button>
                            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2">
                                Reject
                            </button>
                        </div>
                    </div>

                </div>
            ))}
        </div>

      </main>
    </div>
  );
}