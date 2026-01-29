import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeetingRooms from './pages/MeetingRooms';
import RoomSchedule from './pages/RoomSchedule'; // <--- Pastikan ini ada
import Profile from './pages/Profile';
import AddBooking from './pages/AddBooking';
import RoomDetails from './pages/RoomDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meeting-rooms" element={<MeetingRooms />} />
        
        {/* 👇 INI YANG KEMUNGKINAN HILANG/LUPA DIPASANG */}
        <Route path="/room-schedule" element={<RoomSchedule />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-booking" element={<AddBooking />} /> {/* <--- Tambah Route ini */}
        <Route path="/room-details" element={<RoomDetails />} />
      </Routes>
    </Router>
  );
}