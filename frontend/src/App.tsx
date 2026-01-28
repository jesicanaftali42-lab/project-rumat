import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeetingRooms from './pages/MeetingRooms';
import RoomSchedule from './pages/RoomSchedule'; // <--- Pastikan ini ada
import Profile from './pages/Profile';

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
      </Routes>
    </Router>
  );
}