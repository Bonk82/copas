import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { Admin } from './components/Admin';
import { Bet } from './components/Bet';
import { Info } from './components/Info';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Rank } from './components/Rank';
import { Register } from './components/Register';
import { AuthProvider } from './context/AuthContext';
import {AppTheme} from './themes/AppTheme'
import {SupabaseContextProvider} from './context/SupabaseContext.jsx'
import { useEffect } from 'react';
import { supabase } from './supabase/client.js';
import { Navbar } from './components/Navbar.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
    });
  }, [navigate]);

  return (
    <AuthProvider>
      <SupabaseContextProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppTheme>
          <Navbar/>
          <Routes>
            <Route path='/login' element={<Login/>} />
            <Route path='/Register' element={<Register/>} />
            <Route path='/' element={<ProtectedRoute><Info/></ProtectedRoute>} />
            <Route path='/bet' element={<ProtectedRoute><Bet/></ProtectedRoute>} />
            <Route path='/ranking' element={<ProtectedRoute><Rank/></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute><Admin/></ProtectedRoute>} />
            <Route path='/*' element={<ProtectedRoute><Navigate to='/' /></ProtectedRoute>} />
          </Routes>
        </AppTheme>
        </LocalizationProvider>
      </SupabaseContextProvider>
    </AuthProvider>
  )
}

export default App
