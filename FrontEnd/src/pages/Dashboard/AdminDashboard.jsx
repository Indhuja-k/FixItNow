import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  FiHome, FiUsers, FiLogOut, FiClock, FiXCircle, FiTrendingUp, FiActivity,
  FiMapPin, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiStar, FiBarChart2
} from "react-icons/fi";
import { BiClipboard, BiUserCircle } from "react-icons/bi";
import { MdAdminPanelSettings, MdTrendingUp, MdVerified, MdLocationOn } from "react-icons/md";
import { FaUserCheck, FaUserTie, FaMoneyBillWave, FaChartLine, FaWrench, FaTools, FaChartPie } from "react-icons/fa";
import { AiOutlineCheckCircle, AiFillStar } from "react-icons/ai";
import { GiElectric, GiHammerNails, GiBroom } from "react-icons/gi";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  getAllUsers, deleteUser, updateUser, getAllServices,
  updateService, deleteService, getAllBookings
} from "../../services/api";
import ChatComponent from "../../components/ChatComponent";
import ChatNotifications from "../../components/ChatNotifications";

const rustBrown = "#6e290cff";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Restore active tab when navigating from notifications
useEffect(() => {
  const savedTab = localStorage.getItem("activeTab");

  if (savedTab) {
    // Define admin tab order — match sidebar keys
    const tabs = ["home", "users", "services", "chat"];

    // If numeric (e.g., "2"), map to sidebar order
    if (!isNaN(savedTab)) {
      const index = parseInt(savedTab, 10) - 1;
      if (tabs[index]) {
        setActiveTab(tabs[index]);
        console.log(`🔁 Restored tab: ${tabs[index]} (from index ${index + 1})`);
      }
    } else {
      // If it's a string key like "chat" or "users"
      setActiveTab(savedTab);
      console.log(`🔁 Restored tab by name: ${savedTab}`);
    }

    localStorage.removeItem("activeTab"); // Clear after using
  }
}, []);


  // Unified fetch for users, services, bookings (runs in parallel)
  const fetchDashboardData = async () => {
    setLoadingUsers(true);
    setLoadingBookings(true);
    console.log('📊 Fetching dashboard data...');
    try {
      const [usersRes, servicesRes, bookingsRes] = await Promise.all([
        getAllUsers(),
        getAllServices(),
        getAllBookings(),
      ]);

      console.log('✅ Users fetched:', usersRes.data);
      console.log('✅ Services fetched:', servicesRes.data);
      console.log('✅ Bookings fetched:', bookingsRes.data);

      // Users
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersData);

      // Services
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      setServices(servicesData);

      // Bookings (normalize shapes)
      const bookingsRaw = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const bookingsNormalized = bookingsRaw.map((b) => ({
        ...b,
        status: (b.status || 'PENDING').toUpperCase(),
        bookingDate: b.bookingDate || new Date().toISOString(),
        service: b.service ? { ...b.service, price: Number(b.service.price || 0) } : b.service,
      }));
      const bookingsSorted = bookingsNormalized.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      );
      setBookings(bookingsSorted);
      
      console.log('📈 Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Dashboard fetch failed:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 401) {
        console.log('🔒 Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }
      setUsers([]);
      setServices([]);
      setBookings([]);
    } finally {
      setLoadingUsers(false);
      setLoadingBookings(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "Users", icon: <BiUserCircle className="text-white" />, key: "users" },
    { name: "Services", icon: <MdAdminPanelSettings className="text-white" />, key: "services" },
    { name: "Chat", icon: <FiMessageSquare className="text-white" />, key: "chat" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <aside
        className="w-64 p-6 flex flex-col h-screen sticky top-0"
        style={{ backgroundColor: rustBrown }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">FixItNow</h2>
          <p className="text-white/80 text-sm">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 p-4 rounded-md transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-white/30 text-white font-semibold shadow-lg"
                  : "hover:bg-white/10 text-white/90 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-base">{item.name}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 rounded-md mt-auto hover:bg-red-500/20 text-white border border-white/30 hover:border-red-400 transition-all duration-200"
          >
            <FiLogOut className="text-xl" /> 
            <span className="text-base font-semibold">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Notification Icon - Top Right Corner Fixed */}
      <div className="fixed top-4 right-6 z-50">
        <ChatNotifications />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {activeTab === "home" && (
          <>
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6" style={{ color: rustBrown }}>Dashboard Overview</h1>

            {/* Loading State */}
            {(loadingUsers || loadingBookings) ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: rustBrown }}></div>
                  <p className="text-gray-600">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: rustBrown + "20" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Users</p>
                    <h3 className="text-3xl font-bold" style={{ color: rustBrown }}>{users.length}</h3>
                  </div>
                  <FiUsers className="text-4xl" style={{ color: rustBrown }} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: rustBrown + "20" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Bookings</p>
                    <h3 className="text-3xl font-bold" style={{ color: rustBrown }}>{bookings.length}</h3>
                  </div>
                  <BiClipboard className="text-4xl" style={{ color: rustBrown }} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: rustBrown + "20" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Service Providers</p>
                    <h3 className="text-3xl font-bold" style={{ color: rustBrown }}>{users.filter(u => (u.role || "").toLowerCase() === "provider").length}</h3>
                  </div>
                  <FaUserTie className="text-4xl" style={{ color: rustBrown }} />
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Most Booked Services */}
              <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: rustBrown + "20" }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
                  <FaChartPie /> Most Booked Services
                </h3>
                <MostBookedServicesChart bookings={bookings} services={services} />
              </div>
              
              {/* Top Providers */}
              <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: rustBrown + "20" }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
                  <FaUserTie /> Top Providers
                </h3>
                <TopProvidersChart bookings={bookings} users={users} />
              </div>
            </div>

            {/* Location Trends */}
            <div className="bg-white rounded-xl shadow-md p-6 border mb-6" style={{ borderColor: rustBrown + "20" }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
                <MdLocationOn /> Location-Based Service Trends
              </h3>
              <LocationTrendsCard bookings={bookings} users={users} />
            </div>
            </>
            )}
          </>
        )}

        {activeTab === "users" && (
          <UsersCardFull users={users} loading={loadingUsers} setUsers={setUsers} />
        )}

        {activeTab === "services" && (
          <ServicesCardFull services={services} setServices={setServices} />
        )}

        {activeTab === "chat" && (
  <AdminChatSection users={users} />
)}

      </main>
      </div>
    </div>
  );
}

// Enhanced Metric Card with Trend - Modern & Responsive
function MetricCard({ title, value, icon, bgColor = "bg-gray-50", trend }) {
  return (
    <div className={`${bgColor} border-2 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`} style={{ borderColor: rustBrown + "30" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl opacity-80">{icon}</div>
        {trend && (
          <span className="text-sm font-bold text-green-600 flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <FiTrendingUp className="text-sm" /> {trend}
          </span>
        )}
      </div>
      <h2 className="text-4xl font-extrabold mb-2" style={{ color: rustBrown }}>{value}</h2>
      <p className="text-sm font-medium text-gray-700">{title}</p>
    </div>
  );
}

// Users Home
function UsersCardHome({ users, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4 text-center" style={{ borderColor: rustBrown + "40" }}>Loading users...</div>;
  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}><FiUsers /> Users</h2>
      <div className="divide-y divide-black/10">
        {users.map(u => (
          <div key={u.id} className="flex justify-between items-center py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <h3 className="text-lg font-bold">{u.name}</h3>
              <p className="text-sm text-black/70">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {(u.role || "").toLowerCase() === "admin" && <MdAdminPanelSettings className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "provider" && <FaUserTie className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "customer" && <FiUsers className="w-5 h-5" style={{ color: rustBrown }} />}
              <span className="px-3 py-1 text-sm border rounded-full" style={{ borderColor: rustBrown + "40" }}>{u.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bookings Card
function BookingsCard({ bookings, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4" style={{ borderColor: rustBrown + "40" }}>Loading bookings...</div>;

  const getStatusBadge = status => {
    switch(status.toLowerCase()) {
      case "completed": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"><AiOutlineCheckCircle /> {status}</span>;
      case "pending": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full"><FiClock /> {status}</span>;
      case "cancelled": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"><FiXCircle /> {status}</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-black text-white rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> Recent Bookings
      </h2>
      <div className="divide-y divide-black/10">
        {bookings.map((b) => (
          <div key={b.id} className="flex justify-between py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <p className="font-medium">{b.customer?.name}</p>
              <p className="text-sm text-black/70">{b.service?.category} - {b.service?.subcategory}</p>
            </div>
            <div>{getStatusBadge(b.status)}
              <h> ₹{b.service?.price}</h>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}


// Users Full
function UsersCardFull({ users, loading, setUsers }) {
  if (loading)
    return (
      <div
        className="bg-white border rounded-lg p-6 text-center shadow-md"
        style={{ borderColor: rustBrown + "40" }}
      >
        Loading users...
      </div>
    );

  return (
    <div
      className="bg-white border rounded-xl p-6 w-full shadow-md"
      style={{ borderColor: rustBrown + "40" }}
    >
      <h2
        className="text-2xl font-semibold mb-6 flex items-center gap-3"
        style={{ color: rustBrown }}
      >
        <FiUsers /> Manage Users
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <UserCard key={u.id} user={u} setUsers={setUsers} users={users} />
        ))}
      </div>
    </div>
  );
}

// User Card with Modal Popup
function UserCard({ user, users, setUsers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const roleIcon =
    (user.role || "").toLowerCase() === "admin" ? (
      <MdAdminPanelSettings className="w-6 h-6 text-white" />
    ) : (user.role || "").toLowerCase() === "provider" ? (
      <FaUserTie className="w-6 h-6 text-white" />
    ) : (
      <FiUsers className="w-6 h-6 text-white" />
    );

  const handleSave = async () => {
    try {
      await updateUser(user.id, editData);
      setUsers(users.map((u) => (u.id === user.id ? editData : u)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(user.id);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-gradient-to-r from-white to-[#fff7f2] border rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 p-5" style={{ borderColor: rustBrown + "40" }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="px-2 py-2 rounded bg-gradient-to-r from-black to-[#B7410E] shadow-lg">{roleIcon}</div>
          <h3 className="text-lg font-bold">{user.name}</h3>
        </div>
        <p className="text-sm text-black/70 mb-3">{user.email}</p>
        <div className="flex justify-end gap-2">
          <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition" onClick={() => setIsEditing(true)}>Edit</button>
          <button className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Modal */}
      
{isEditing && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setIsEditing(false)} // Close on outside click
  >
    <div 
      className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
    >
      {/* Close Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
      <input
        type="text"
        value={editData.name}
        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Name"
      />
      <input
        type="email"
        value={editData.email}
        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Email"
      />
      <select
        value={editData.role}
        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-4"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
)}

    </>
  );
}

// Services Full
function ServicesCardFull({ services, setServices }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} setServices={setServices} services={services} />
      ))}
    </div>
  );
}

// Service Card with Modal
function ServiceCard({ service, services, setServices }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...service });

  const icon =
  (service.category || "").toLowerCase() === "carpentry" ? <GiHammerNails className="text-white" /> :
    (service.category || "").toLowerCase() === "electrical" ? <GiElectric className="text-white" /> :
    (service.category || "").toLowerCase() === "cleaning" ? <GiBroom className="text-white" /> :
    <GiHammerNails className="text-white" />;
  const handleSave = async () => {
    try {
      await updateService(service.id, editData);
      setServices(services.map((s) => (s.id === service.id ? editData : s)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update service.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(service.id);
      console.log("Deleting service id:", service.id);

      setServices(services.filter((s) => s.id !== service.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-white border rounded-xl shadow-lg hover:shadow-xl transition p-5 border-gray-200" style={{ borderColor: rustBrown + "40" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-black to-[#B7410E] shadow-lg">{icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{service.category} - {service.subcategory}</h3>
            <p className="text-sm text-black/70">Provider: {service.providerName}</p>
          </div>
        </div>
        <p className="text-sm text-black/70 mb-4">{service.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-black text-lg">₹{service.price}</span>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">Edit</button>
            <button onClick={handleDelete} className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition">Delete</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isEditing && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setIsEditing(false)}
  >
    <div 
      className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit Service</h2>
      <input
        type="text"
        value={editData.description}
        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Description"
      />
      <input
        type="number"
        value={editData.price}
        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Price"
      />
      <input
        type="text"
        value={editData.availability}
        onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Availability"
      />
      <div className="flex justify-end gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
)}
</>
  );
}

function AdminChatSection({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // Show only providers and customers (not admins)
  const chatUsers = users.filter(
    (u) => (u.role || "").toLowerCase() !== "admin"
  );

  return (
    <div className="flex flex-col md:flex-row  h-[90vh] bg-white rounded-xl shadow-lg border border-[#6e290c30] overflow-hidden">
      {/* User List Sidebar */}
      <div className="md:w-1/3 w-full bg-[#fff8f4] border-r border-[#6e290c30] overflow-y-auto" >
        <div className="sticky top-0 bg-[#6e290c] text-white p-4 font-semibold text-lg flex items-center justify-between" >
          <span>Chats</span>
          <span className="text-sm font-normal opacity-80" >
            {chatUsers.length} users
          </span>
        </div>

        {chatUsers.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center" >
            No users available
          </div>
        ) : (
          chatUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-4 border-b border-[#6e290c20] cursor-pointer transition-colors duration-200 ${
                selectedUser?.id === u.id
                  ? "bg-[#6e290c] text-white"
                  : "hover:bg-[#f8e9e2] text-gray-800"
              }`}
            >
              <div className="flex justify-between items-center" >
                <div>
                  <p className="font-semibold text-base">{u.name}</p>
                  <p
                    className={`text-xs ${
                      selectedUser?.id === u.id
                        ? "text-white/70"
                        : "text-gray-600"
                    }`}
                  >
                    {u.role}
                  </p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedUser?.id === u.id
                      ? "bg-green-300"
                      : "bg-gray-300"
                  }`}
                  title="Online status"
                ></span>
              </div>
            </div>
          ))
        )}
      </div>

     {/* Right panel: Chat area */}
<div className="flex-1 flex flex-col bg-white h-[30rem]">
  <div className="flex flex-col flex-grow border-l border-[#6e290c30]">
    {selectedUser ? (
      <>
        {/* Header */}
        

        {/* ChatComponent — full height below header */}
        <div className="flex-1 h-96">
          <ChatComponent receiverId={selectedUser.id}  />
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center flex-1 text-gray-500">
        Select a user to start chatting
      </div>
    )}
  </div>
</div>
    </div>
  );
}

// Status Distribution Card - Analytics Component with Pie Chart
function StatusDistributionCard({ bookings }) {
  const statusCounts = bookings.reduce((acc, booking) => {
    const status = (booking.status || 'UNKNOWN').toUpperCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const total = bookings.length || 1;
  
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: count,
    percentage: ((count / total) * 100).toFixed(1)
  }));

  const COLORS = {
    'Completed': '#10b981',
    'Pending': '#f59e0b',
    'Confirmed': '#3b82f6',
    'Cancelled': '#ef4444',
    'Unknown': '#6b7280'
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> Booking Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">Total Bookings: <span className="font-bold">{total}</span></p>
      </div>
    </div>
  );
}

// Category Distribution Card - Analytics Component with Bar Chart
function CategoryDistributionCard({ services }) {
  const categoryCounts = services.reduce((acc, service) => {
    const category = service.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    fill: getCategoryColor(category)
  }));

  function getCategoryColor(category) {
    switch(category.toLowerCase()) {
      case 'plumbing': return '#3b82f6';
      case 'electrical': return '#eab308';
      case 'carpentry': return '#f59e0b';
      case 'cleaning': return '#10b981';
      default: return '#6b7280';
    }
  }

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'plumbing': return <FaWrench className="text-blue-600" />;
      case 'electrical': return <GiElectric className="text-yellow-600" />;
      case 'carpentry': return <GiHammerNails className="text-amber-600" />;
      case 'cleaning': return <GiBroom className="text-green-600" />;
      default: return <MdAdminPanelSettings className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <FaChartLine /> Service Categories
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#6e290c" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">Total Services: <span className="font-bold">{services.length}</span></p>
      </div>
    </div>
  );
}

// User Role Distribution Card - Analytics Component with Pie Chart
function UserRoleDistributionCard({ users }) {
  const roleCounts = users.reduce((acc, user) => {
    const role = (user.role || 'UNKNOWN').toUpperCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(roleCounts).map(([role, count]) => ({
    name: role.charAt(0) + role.slice(1).toLowerCase(),
    value: count,
    percentage: ((count / users.length) * 100).toFixed(1)
  }));

  const COLORS = {
    'Admin': '#ef4444',
    'Provider': '#3b82f6',
    'Customer': '#10b981',
    'Unknown': '#6b7280'
  };

  const getRoleIcon = (role) => {
    switch(role.toLowerCase()) {
      case 'admin': return <MdAdminPanelSettings className="text-red-600" />;
      case 'provider': return <FaUserTie className="text-blue-600" />;
      case 'customer': return <FiUsers className="text-green-600" />;
      default: return <BiUserCircle className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <FiUsers /> User Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">Total Users: <span className="font-bold">{users.length}</span></p>
      </div>
    </div>
  );
}

// Revenue Overview Card - Analytics Component with Area Chart
function RevenueOverviewCard({ bookings }) {
  const completedBookings = bookings.filter(b => b.status?.toLowerCase() === 'completed');
  const pendingBookings = bookings.filter(b => b.status?.toLowerCase() === 'pending');
  
  const completedRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);
  const totalRevenue = completedRevenue + pendingRevenue;

  // Generate monthly revenue data (last 6 months)
  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  for (let i = 5; i >= 0; i--) {
    const monthRevenue = Math.floor(totalRevenue / 6 + (Math.random() - 0.5) * (totalRevenue / 10));
    monthlyData.push({
      month: months[5 - i],
      revenue: monthRevenue,
      bookings: Math.floor(bookings.length / 6)
    });
  }

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <FaMoneyBillWave /> Revenue Overview
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#6e290c" fill="#f59e0b" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-xl font-bold text-green-700">₹{completedRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{completedBookings.length} bookings</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-700">₹{pendingRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{pendingBookings.length} bookings</p>
        </div>
      </div>
    </div>
  );
}

// Recent Activity Card - Analytics Component
function RecentActivityCard({ bookings, users }) {
  const recentActivities = [
    ...bookings.slice(0, 5).map(b => ({
      type: 'booking',
      message: `New booking by ${b.customer?.name || 'Customer'}`,
      time: new Date(b.bookingDate).toLocaleDateString(),
      icon: <BiClipboard className="text-blue-600" />,
      status: b.status
    })),
    ...users.slice(-3).map(u => ({
      type: 'user',
      message: `New ${u.role?.toLowerCase()} registered: ${u.name}`,
      time: new Date(u.createdAt).toLocaleDateString(),
      icon: <FiUsers className="text-green-600" />,
      status: 'new'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-md" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <FiActivity /> Recent Activity
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="text-2xl mt-1">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
            {activity.status && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                {activity.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Most Booked Services Chart - Bar Chart with Recharts
function MostBookedServicesChart({ bookings, services }) {
  const serviceCounts = bookings.reduce((acc, booking) => {
    const serviceId = booking.service?.id;
    if (serviceId) {
      acc[serviceId] = (acc[serviceId] || 0) + 1;
    }
    return acc;
  }, {});

  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([serviceId, count]) => {
      const service = services.find(s => s.id === parseInt(serviceId));
      return {
        name: service ? service.subcategory : 'Unknown',
        bookings: count,
        category: service?.category || 'Other'
      };
    });

  const COLORS = ['#6e290c', '#8b3a1a', '#a84b28', '#c55c36', '#e26d44'];

  return (
    <div>
      {topServices.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <FiAlertCircle className="mx-auto text-5xl mb-3" />
          <p>No booking data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topServices}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="bookings" fill={rustBrown} radius={[8, 8, 0, 0]}>
              {topServices.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Top Providers Chart - Pie Chart with Recharts
function TopProvidersChart({ bookings, users }) {
  const providerCounts = bookings.reduce((acc, booking) => {
    const providerId = booking.provider?.id;
    if (providerId) {
      acc[providerId] = {
        count: (acc[providerId]?.count || 0) + 1,
        revenue: (acc[providerId]?.revenue || 0) + (Number(booking.service?.price) || 0)
      };
    }
    return acc;
  }, {});

  const topProviders = Object.entries(providerCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([providerId, data]) => {
      const provider = users.find(u => u.id === parseInt(providerId));
      return {
        name: provider?.name || 'Unknown',
        bookings: data.count,
        revenue: data.revenue
      };
    });

  const COLORS = ['#6e290c', '#8b3a1a', '#a84b28', '#c55c36', '#e26d44'];

  return (
    <div>
      {topProviders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <FiAlertCircle className="mx-auto text-5xl mb-3" />
          <p>No provider data</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topProviders}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="bookings"
              >
                {topProviders.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {topProviders.map((provider, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  {provider.name}
                </span>
                <span className="font-semibold" style={{ color: rustBrown }}>
                  ₹{provider.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Location Trends Card - Interactive Map with Markers and Statistics
function LocationTrendsCard({ bookings, users }) {
  console.log('📍 LocationTrendsCard - Bookings:', bookings);
  console.log('📍 LocationTrendsCard - Users:', users);
  
  // Location coordinates for Tamil Nadu cities
  const locationCoordinates = {
    'Namakkal': { lat: 11.2189, lng: 78.1677 },
    'Salem': { lat: 11.6643, lng: 78.1460 },
    'Erode': { lat: 11.3410, lng: 77.7172 },
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Madurai': { lat: 9.9252, lng: 78.1198 },
    'Trichy': { lat: 10.7905, lng: 78.7047 },
    'Tiruppur': { lat: 11.1075, lng: 77.3398 },
  };

  // Process booking data by location
  const locationStats = {};
  const locationMarkers = [];
  
  bookings.forEach(booking => {
    const customerLocation = booking.customer?.location || booking.service?.location || 'Unknown';
    const cityName = customerLocation.split(',')[0].trim();
    
    console.log('Processing booking:', booking.id, 'Location:', customerLocation, 'City:', cityName);
    
    // Initialize location stats
    if (!locationStats[cityName]) {
      locationStats[cityName] = {
        total: 0,
        completed: 0,
        pending: 0,
        revenue: 0,
        coordinates: locationCoordinates[cityName] || null
      };
    }
    
    // Update stats
    locationStats[cityName].total += 1;
    locationStats[cityName].revenue += Number(booking.service?.price) || 0;
    
    if (booking.status === 'COMPLETED') {
      locationStats[cityName].completed += 1;
    } else {
      locationStats[cityName].pending += 1;
    }
    
    // Add marker data
    if (locationStats[cityName].coordinates) {
      locationMarkers.push({
        id: booking.id,
        position: locationStats[cityName].coordinates,
        serviceType: booking.service?.category || 'Service',
        subcategory: booking.service?.subcategory || '',
        status: booking.status,
        customerName: booking.customer?.name || 'Customer',
        location: cityName,
        price: booking.service?.price || 0
      });
    }
  });

  console.log('📍 Location Stats:', locationStats);
  console.log('📍 Location Markers:', locationMarkers);

  // Convert to array and sort
  const locationArray = Object.entries(locationStats)
    .map(([location, stats]) => ({ location, ...stats }))
    .filter(loc => loc.coordinates)
    .sort((a, b) => b.total - a.total);

  // Calculate totals
  const totalBookings = locationArray.reduce((sum, loc) => sum + loc.total, 0);
  const totalCompleted = locationArray.reduce((sum, loc) => sum + loc.completed, 0);
  const totalPending = locationArray.reduce((sum, loc) => sum + loc.pending, 0);

  // Center map on Tamil Nadu (average of all locations)
  const centerPosition = [11.1271, 78.6569]; // Tamil Nadu center

  console.log('🗺️ Map will render with', locationMarkers.length, 'markers');

  return (
    <div>
      {/* Map Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h4 className="text-lg font-semibold mb-3" style={{ color: rustBrown }}>Service Location Map</h4>
        {locationMarkers.length > 0 ? (
          <div style={{ height: '450px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <MapContainer 
              center={centerPosition} 
              zoom={8} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locationMarkers.map((marker, index) => (
                <Marker key={index} position={[marker.position.lat, marker.position.lng]}>
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold text-sm mb-1" style={{ color: rustBrown }}>
                        {marker.serviceType} - {marker.subcategory}
                      </h4>
                      <p className="text-xs text-gray-600"><strong>Customer:</strong> {marker.customerName}</p>
                      <p className="text-xs text-gray-600"><strong>Location:</strong> {marker.location}</p>
                      <p className="text-xs text-gray-600"><strong>Price:</strong> ₹{marker.price.toLocaleString()}</p>
                      <p className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          marker.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {marker.status}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 border border-gray-200 rounded-lg bg-gray-50">
            <FiMapPin className="mx-auto text-5xl mb-3" />
            <p className="font-semibold">No location data available</p>
            <p className="text-sm mt-2">Bookings with location information will appear on the map</p>
          </div>
        )}
      </div>

      {/* Location Statistics Summary */}
      {locationArray.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border" style={{ borderColor: rustBrown + "20" }}>
            <p className="text-gray-500 text-xs mb-1">Total Requests</p>
            <h3 className="text-2xl font-bold" style={{ color: rustBrown }}>{totalBookings}</h3>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border border-green-200">
            <p className="text-gray-500 text-xs mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-green-600">{totalCompleted}</h3>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border border-yellow-200">
            <p className="text-gray-500 text-xs mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600">{totalPending}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Verification Card - Week 8 Requirement
function ServiceVerificationCard({ services, users, setServices }) {
  const [verifying, setVerifying] = useState(null);

  const pendingServices = services.filter(s => {
    const provider = users.find(u => u.id === s.provider?.id);
    return provider && !provider.verified;
  });

  const handleVerify = async (serviceId, providerId) => {
    setVerifying(serviceId);
    try {
      // Update provider verification status
      const provider = users.find(u => u.id === providerId);
      if (provider) {
        await updateUser(providerId, { ...provider, verified: true });
        alert('Provider verified successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to verify provider');
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (serviceId) => {
    if (!window.confirm('Are you sure you want to reject this service?')) return;
    setVerifying(serviceId);
    try {
      await deleteService(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
      alert('Service rejected and removed');
    } catch (err) {
      console.error(err);
      alert('Failed to reject service');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: rustBrown }}>
        <MdVerified className="text-2xl" /> Service Verification
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {pendingServices.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FiCheckCircle className="mx-auto text-4xl mb-2 text-green-500" />
            <p>All services verified!</p>
          </div>
        ) : (
          pendingServices.slice(0, 5).map((service) => {
            const provider = users.find(u => u.id === service.provider?.id);
            return (
              <div key={service.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{service.category} - {service.subcategory}</h4>
                    <p className="text-sm text-gray-600 mt-1">Provider: {provider?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">Location: {service.location || 'Not specified'}</p>
                    <p className="text-sm font-semibold mt-2" style={{ color: rustBrown }}>₹{service.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleVerify(service.id, provider?.id)}
                      disabled={verifying === service.id}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-1 text-sm"
                    >
                      <FiCheckCircle /> Verify
                    </button>
                    <button
                      onClick={() => handleReject(service.id)}
                      disabled={verifying === service.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1 text-sm"
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{service.description || 'No description'}</p>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          Pending Verification: <span className="font-bold">{pendingServices.length}</span>
        </p>
      </div>
    </div>
  );
}

// Dispute Management Card - Week 8 Requirement
function DisputeManagementCard({ bookings }) {
  const [resolving, setResolving] = useState(null);

  const disputedBookings = bookings.filter(b => 
    b.status?.toLowerCase() === 'cancelled' || 
    (b.status?.toLowerCase() === 'pending' && new Date(b.bookingDate) < new Date())
  );

  const handleResolve = async (bookingId) => {
    setResolving(bookingId);
    try {
      // Simulate dispute resolution
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Dispute resolved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to resolve dispute');
    } finally {
      setResolving(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-red-50 border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: rustBrown + "20" }}>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: rustBrown }}>
        <FiAlertCircle className="text-2xl" /> Dispute Management
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {disputedBookings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FiCheckCircle className="mx-auto text-4xl mb-2 text-green-500" />
            <p>No disputes to handle</p>
          </div>
        ) : (
          disputedBookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-800">{booking.service?.category}</h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-gray-600">Customer: {booking.customer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Provider: {booking.provider?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-semibold mt-2" style={{ color: rustBrown }}>
                    ₹{booking.service?.price?.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(booking.id)}
                  disabled={resolving === booking.id}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  <FiCheckCircle /> Resolve
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiAlertCircle className="text-red-500" />
                <span>Requires attention</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          Active Disputes: <span className="font-bold">{disputedBookings.length}</span>
        </p>
      </div>
    </div>
  );
}
