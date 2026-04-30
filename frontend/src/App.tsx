import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Sessions from './pages/Sessions';
import Messages from './pages/Messages';
import Resources from './pages/Resources';
import AiLab from './pages/AiLab';
import SignupChoice from './pages/SignupChoice';
import SignupForm from './pages/SignupForm';
import Profile from './pages/Profile';
import HowItWorks from './pages/HowItWorks';
import ContactUs from './pages/ContactUs';
import Community from './pages/Community';
import GlobalLayout from './layouts/GlobalLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/community" element={<Community />} />
        
        {/* All other pages share the global background */}
        <Route element={<GlobalLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/ai-lab" element={<AiLab />} />
          <Route path="/signup" element={<SignupChoice />} />
          <Route path="/signup/:role" element={<SignupForm />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
