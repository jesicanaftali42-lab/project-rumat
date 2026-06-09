import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MeetingRooms from './pages/MeetingRooms';
import RoomSchedule from './pages/RoomSchedule';
import Profile from './pages/Profile';
import AddBooking from './pages/AddBooking';
import RoomDetails from './pages/RoomDetails';
import AdminDashboard from './pages/AdminDashboard';
import ListBooking from './pages/ListBooking';
import RequestBooking from './pages/RequestBooking';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageRooms from './pages/ManageRooms';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC --- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- DASHBOARDS --- */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />

        {/* --- FEATURES --- */}
        <Route path="/meeting-rooms" element={<MeetingRooms />} />
        <Route path="/request-booking" element={<RequestBooking />} />
        <Route path="/room-schedule" element={<RoomSchedule />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-booking" element={<AddBooking />} /> 
        <Route path="/room-details" element={<RoomDetails />} />
        <Route path="/list-booking" element={<ListBooking />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-rooms" element={<ManageRooms />} />
      </Routes>
    </Router>
  );
}