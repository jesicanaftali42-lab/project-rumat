import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Users,
  Calendar,
  User,
  LogOut,
  Search,
  Filter,
  Wifi,
  Tv,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type Room = {
  id: number;
  name: string;
  floor: number;
  capacity: number;
  facilities: string[];
  isAvailable?: boolean;
  description?: string;

  image?: string;
  time?: string;
};

export default function MeetingRooms() {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeFloor, setActiveFloor] = useState("Lantai 6");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("User");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CEK LOGIN ---
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!savedName || !token) {
      navigate("/");
      return;
    }

    setUsername(savedName || "User");
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // --- FETCH ROOMS ---
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const res = await axios.get("http://localhost:3000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataAsli = Array.isArray(res.data) ? res.data : res.data.data;

      // Tambahin image/time kalau backend belum ada
      const mapped: Room[] = (dataAsli || []).map((room: Room) => ({
        ...room,
        time: room.time || "07:00 AM - 05:00 PM",
        image:
          room.image ||
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&fit=crop",
      }));

      setRooms(mapped);
    } catch (err: any) {
      console.error("Error fetch rooms:", err);

      if (err?.response?.status === 401) {
        alert("Session habis, silakan login ulang.");
        localStorage.clear();
        navigate("/");
        return;
      }
      alert("Gagal ambil data rooms dari backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredRooms = rooms.filter((room) => {
    const targetFloor = parseInt(activeFloor.split(" ")[1]);
    const isFloorMatch = room.floor === targetFloor;
    const isSearchMatch = room.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return isFloorMatch && isSearchMatch;
  });

  // Helper: gambar random (biar beda tiap room)
  const getRandomImage = (id: number) => {
    const images = [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&fit=crop",
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=400&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&fit=crop",
    ];
    return images[id % images.length];
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-100 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <img
            src="/logo.png"
            alt="RuMate Logo"
            className="h-10 object-contain"
          />
          <span className="text-xl font-bold text-blue-600">RuMate</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<LayoutGrid size={20} />}
            label="Dashboard"
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Meeting Rooms"
            active
            onClick={() => navigate("/meeting-rooms")}
          />
          <NavItem
            icon={<Calendar size={20} />}
            label="Room Schedule"
            onClick={() => navigate("/room-schedule")}
          />
          <NavItem
            icon={<User size={20} />}
            label="Profile"
            onClick={() => navigate("/profile")}
          />
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto pt-6 border-t"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Atas */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
            <p className="text-gray-500 text-sm mt-1">
              Book a room suitable for your team.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{username}</p>
              <p className="text-xs text-blue-500 font-bold">Employee</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-blue-200">
              <img
                src="/logo.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* TAB LANTAI */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          {["Lantai 6", "Lantai 7", "Lantai 8"].map((lantai) => (
            <button
              key={lantai}
              onClick={() => setActiveFloor(lantai)}
              className={`pb-3 text-sm font-bold transition-all ${
                activeFloor === lantai
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {lantai}
            </button>
          ))}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your room"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm transition"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 shadow-sm transition">
            <span>Sort by: Room Name (Z-A)</span>
            <Filter size={14} />
          </button>
        </div>

        {/* LIST RUANGAN */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Memuat data ruangan...
            </div>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition duration-300"
              >
                {/* Gambar */}
                <div className="w-full md:w-64 h-40 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                  <img
                    src={room.image || getRandomImage(room.id)}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <MapPin size={10} /> Lantai {room.floor}
                  </div>
                </div>

                {/* Detail */}
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium mb-4">
                    {room.time}
                  </p>

                  <div className="flex items-center gap-6 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <span>{room.capacity} Orang</span>
                    </div>

                    {room.facilities?.some((f) =>
                      f.toLowerCase().includes("wifi")
                    ) && (
                      <div className="flex items-center gap-2">
                        <Wifi size={18} />
                        <span>Wifi</span>
                      </div>
                    )}

                    {room.facilities?.some(
                      (f) =>
                        f.toLowerCase().includes("tv") ||
                        f.toLowerCase().includes("projector")
                    ) && (
                      <div className="flex items-center gap-2">
                        <Tv size={18} />
                        <span>Display</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-gray-900 font-bold cursor-pointer hover:text-orange-500">
                      <span>More+</span>
                    </div>
                  </div>
                </div>

                {/* Tombol */}
                <div className="w-full md:w-auto flex justify-end gap-3">
                  <button
                    onClick={() =>
                      navigate("/room-details", { state: { room } })
                    }
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-6 py-3 rounded-lg transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      navigate("/add-booking", {
                        state: {
                          roomId: room.id,
                          roomName: room.name,
                          floor: room.floor,
                        },
                      })
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors uppercase shadow-lg shadow-blue-200"
                  >
                    BOOK NOW
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium">
                Tidak ada ruangan ditemukan di {activeFloor}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Coba pilih lantai lain atau hubungi Admin.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Komponen NavItem ---
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
        active
          ? "bg-orange-50 text-orange-500 font-bold"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}