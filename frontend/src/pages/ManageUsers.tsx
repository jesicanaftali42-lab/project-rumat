import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Trash2, User, ShieldAlert, Plus, X, Edit, Save, 
  LayoutGrid, Mail, Briefcase, DoorOpen, Users, LogOut, Search 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    division: "SIT"
  });

  // Daftar Divisi Dropdown
  const divisions = [
    "SRC", "SCA", "SPA", "SSA", "SBA", "SQA", "SMI", "SSM", "SSW", "SMD", 
    "SMT", "SPE", "SSC", "SHL", "SEE", "SHW", "SSE", "SCD", "SAC", "SPN", 
    "SPO", "SBC", "SFT", "SCM", "SBD", "SPP", "SFN", "SIT", "SIS"
  ];

  const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({ username: "", email: "", password: "", role: "user", division: "SIT" });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setIsEdit(true);
    setCurrentId(user.id);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role,
      division: user.division || "SIT"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend: any = { ...formData };
      if (isEdit && !dataToSend.password) delete dataToSend.password;

      if (isEdit && currentId) {
        await axios.patch(`http://localhost:3000/users/${currentId}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:3000/users", dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleLogout = () => { sessionStorage.clear(); navigate('/'); };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.division?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <NavItem icon={<Users size={20} />} label="Manage Users" active onClick={() => navigate('/manage-users')} />
            <NavItem icon={<DoorOpen size={20} />} label="Manage Rooms" onClick={() => navigate('/manage-rooms')} />
          </div>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors mt-auto pt-6 border-t border-slate-800">
          <LogOut size={20} /> <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">User Management</h1>
            <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
              <Plus size={20} /> Add New User
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input type="text" placeholder="Cari username atau divisi..." className="flex-1 outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-5">User Profile</th>
                    <th className="px-6 py-5">Access Level</th>
                    <th className="px-6 py-5">Division</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{user.username}</div>
                        <div className="text-xs text-slate-400">{user.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          user.role === 'super_admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          user.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{user.division}</td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Update User" : "Create New Account"}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-black">Full Username</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-black">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-black">Security Password</label>
                  <input type="password" required={!isEdit} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-black">Assign Role</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-black">Work Division</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.division}
                      onChange={(e) => setFormData({...formData, division: e.target.value})}
                    >
                      {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl mt-6 flex items-center justify-center gap-2 transition-all">
                <Save size={20} /> {isEdit ? "Update User" : "Save User Account"}
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
      <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all font-medium ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        {icon} <span className="text-sm">{label}</span>
      </button>
    );
}