import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Buy from "./Pages/Buy";
import Rent from "./Pages/Rent";
import Sell from "./Pages/Sell";
import Contact from "./Pages/Contact";
import About from "./components/About";
import Careers from "./components/Careers";
import Terms from "./components/TnC";
import PrivacyPolicy from "./components/Policy";
import FAQ from "./components/FAQ";
import { Box } from "@mui/material";
import Login from './Pages/Login';
import Details from './Pages/Details';
import Wishlist from './Pages/Wishlist';
import PropertyDetails from "./pages/PropertyDetails";
import Payment from "./Pages/Payment";
import Admin from "./Pages/Admin";
import SuccessPage from "./Pages/SuccessPage";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUsername(user.name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  return (
    <Router>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw",
        }}
      >
        <Header
          isLoggedIn={isLoggedIn}
          username={username}
          onLogout={handleLogout}
        />

        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/rent" element={<Rent />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/viewdetails" element={<Details />} /> 
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/success" element={<SuccessPage></SuccessPage>} />
            <Route path="/admin" element={<Admin onLogout={handleLogout} />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  );
}

export default App;
