import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Plus, Edit, Trash2, DoorOpen, ArrowLeft, 
  Search, Users, MapPin, Save, X, Upload, LayoutGrid, ShieldAlert, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Room {
  id: number;
  name: string;
  floor: number;
  capacity: number;
  facilities: string[];
  isAvailable: boolean;
  image_url?: string;
}

export default function ManageRooms() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    floor: "",
    facilities: "TV, AC, WiFi",
    isAvailable: true
  });

  const userString = sessionStorage.getItem("user");
  const token = userString ? JSON.parse(userString).access_token : '';
  const currentUser = JSON.parse(userString || "{}");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataAsli = Array.isArray(response.data) ? response.data : response.data.data;
      setRooms(dataAsli || []);
    } catch (error) {
      console.error("Gagal ambil data ruangan", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // 🔥🔥🔥 BAGIAN INI SUDAH DIPERBAIKI 🔥🔥🔥
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    // Kirim angka, Backend (DTO) yang akan mengubahnya menjadi Number
    data.append('capacity', formData.capacity); 
    data.append('floor', formData.floor);
    data.append('isAvailable', String(formData.isAvailable));
    
    // Fasilitas
    const facilitiesArray = formData.facilities.split(",").map(f => f.trim());
    facilitiesArray.forEach(f => data.append('facilities[]', f));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      // ⚠️ PENTING: Jangan set Content-Type manual untuk FormData!
      const config = {
        headers: { 
            Authorization: `Bearer ${token}`
            // 'Content-Type': 'multipart/form-data'  <-- INI SAYA HAPUS BIAR AXIOS OTOMATIS
        }
      };

      if (isEdit && currentId) {
        await axios.patch(`http://localhost:3000/rooms/${currentId}`, data, config);
      } else {
        await axios.post("http://localhost:3000/rooms", data, config);
      }
      
      setShowModal(false);
      fetchRooms();
      alert("Berhasil menyimpan ruangan!");
      
    } catch (error: any) {
      console.error("Error Submit:", error.response?.data); 
      const serverMessage = error.response?.data?.message;
      const displayMessage = Array.isArray(serverMessage) 
        ? serverMessage.join(", ") 
        : serverMessage || "Gagal menyimpan data.";
        
      alert("Gagal: " + displayMessage);
    }
  };

  const openEditModal = (room: Room) => {
    setIsEdit(true);
    setCurrentId(room.id);
    setPreviewUrl(room.image_url || "");
    setSelectedFile(null);
    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      floor: String(room.floor),
      facilities: room.facilities?.join(", ") || "TV, AC, WiFi",
      isAvailable: room.isAvailable ?? true
    });
    setShowModal(true);
  };

  const handleLogout = () => { sessionStorage.clear(); navigate('/'); };

  if (currentUser.role !== 'super_admin') {
    return <div className="h-screen flex items-center justify-center text-red-500 font-bold">AKSES DITOLAK</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldAlert size={20} className="text-white"/>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-none text-white"></span>
              <span className="text-lg font-bold tracking-tight block">RuMat</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Super Panel</span>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Main Menu</p>
            <NavItem icon={<LayoutGrid size={20} />} label="Overview" onClick={() => navigate('/super-admin')} />
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Management</p>
            <NavItem icon={<Users size={20} />} label="Manage Users" onClick={() => navigate('/manage-users')} />
            <NavItem icon={<DoorOpen size={20} />} label="Manage Rooms" active onClick={() => navigate('/manage-rooms')} />
          </div>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors mt-auto pt-6 border-t border-slate-800">
          <LogOut size={20} /> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black flex items-center gap-3 text-slate-900">
                <DoorOpen className="text-orange-500" size={36} /> Room Management
              </h1>
              <p className="text-slate-500 mt-1 font-medium">Atur ketersediaan dan fasilitas ruangan rapat Anda.</p>
            </div>
            <button onClick={() => { setIsEdit(false); setPreviewUrl(""); setSelectedFile(null); setFormData({name:"", capacity:"", floor:"", facilities:"TV, AC, WiFi", isAvailable: true}); setShowModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-orange-100 transition-all active:scale-95">
              <Plus size={24} /> ADD NEW ROOM
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama ruangan..." 
              className="flex-1 outline-none bg-transparent font-medium text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Room Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                <div className="col-span-full text-center py-20 text-slate-400 font-bold">Loading facilities...</div>
            ) : rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((room) => (
              <div key={room.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="h-48 bg-slate-200 overflow-hidden relative">
                  <img src={room.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Lantai {room.floor}</div>
                  {!room.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-lg font-black text-xs uppercase tracking-tighter">Maintenance</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-800">{room.name}</h3>
                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-bold text-xs">
                        <Users size={14} /> {room.capacity}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 border-t border-slate-50 pt-4">
                    <button onClick={() => openEditModal(room)} className="flex-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-3 rounded-xl font-bold flex justify-center gap-2 transition-colors border border-transparent hover:border-blue-100"><Edit size={18}/> Edit</button>
                    <button onClick={() => { if(window.confirm("Hapus ruangan ini?")) axios.delete(`http://localhost:3000/rooms/${room.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(()=>fetchRooms()) }} className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 p-3 rounded-xl transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            
            <div className="w-full md:w-1/2 bg-slate-50 flex flex-col items-center justify-center border-r border-slate-200 p-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-all overflow-hidden bg-white group"
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-orange-500 transition-colors">
                    <Upload size={48} className="mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest text-center px-4 leading-tight">Click to upload room image</p>
                  </div>
                )}
              </div>
              {previewUrl && <button onClick={() => {setPreviewUrl(""); setSelectedFile(null)}} className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Remove Photo</button>}
            </div>

            <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-8 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 leading-none">{isEdit ? "Update" : "Add"} Room</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={28} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Name</label>
                  <input type="text" placeholder="e.g. Cemara Room" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</label>
                    <input type="number" required min="1" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none" value={formData.capacity} onChange={(e) => {const val = e.target.value; if(val == "" || Number(val) > 0) {setFormData({...formData, capacity: val})}}} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor</label>
                    <input type="number" required min="0" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none" value={formData.floor} onChange={(e) =>{const val = e.target.value; if(val == "" || Number(val) >= 0) {setFormData({...formData, floor: val})}}} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facilities</label>
                  <input type="text" placeholder="TV, AC, WiFi" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-orange-500 outline-none" value={formData.facilities} onChange={(e) => setFormData({...formData, facilities: e.target.value})} />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="avail" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} className="w-5 h-5 accent-orange-500 cursor-pointer" />
                    <label htmlFor="avail" className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">Room is Available for Booking</label>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]">
                <Save size={20} /> {isEdit ? "UPDATE ROOM" : "SAVE FACILITY"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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