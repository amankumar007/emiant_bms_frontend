import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

import Auth from "./pages/Auth";
import Otp from "./pages/Otp";



function App() {
  return (
    <BrowserRouter>
      <Routes>


        <Route path="/" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/otp" element={<Otp />} />
        <Route  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/:device_id" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
