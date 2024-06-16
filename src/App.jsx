import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Admin } from './components/Admin';
import { Bet } from './components/Bet';
import { Info } from './components/Info';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Rank } from './components/Rank';
import { Register } from './components/Register';
import { AuthContextProvider } from './context/AuthContext';
import {AppTheme} from './themes/AppTheme'
import {SupabaseContextProvider} from './context/SupabaseContext.jsx'
import { useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function App() {

  // useEffect(() => {
  //   console.log('por navegador de app');
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     console.log('dentro de statechange',_event,session);
  //     if (!session) navigate("/login");
  //   });
  // }, [navigate]);

  return (
    <AuthContextProvider>
      <SupabaseContextProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppTheme>
          <Routes>
            <Route path='/login' element={<Login/>} />
            <Route path='/Register' element={<Register/>} />
            <Route path='/' element={<ProtectedRoute><Navbar/><Info/></ProtectedRoute>} />
            <Route path='/bet' element={<ProtectedRoute><Navbar/><Bet/></ProtectedRoute>} />
            <Route path='/ranking' element={<ProtectedRoute><Navbar/><Rank/></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute><Navbar/><Admin/></ProtectedRoute>} />
            <Route path='/*' element={<ProtectedRoute><Navigate to='/' /></ProtectedRoute>} />
          </Routes>
        </AppTheme>
        </LocalizationProvider>
      </SupabaseContextProvider>
    </AuthContextProvider>
  )
}

export default App
