import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import { Google, HowToReg, LockOpen } from '@mui/icons-material';
import { useEffect } from 'react';
import { useSupa } from '../context/SupabaseContext';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © Bonk '}
      {/* <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '} */}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// const theme = createTheme();

export const Login = () => {
  // const [usuario, setUsuario] = useState({email:'',password:''});
  const { signInWithGoogle,singUpWithPassword, signInWithEmail,usuario } = useSupa();
  const [form, setForm] = useState({email:'',password:''})
  const [error, setError] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('revisando',usuario);
    if(usuario?.role) navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])
  
  const signUp = async(e)=>{
    e.preventDefault()
    if(!form.email || form.password) {
      setError('Debe llenar email y password con datos adecuados')
      return false
    }
    console.log('signUp',form );
    try {
      // const r = await singUpWithPassword(valores.email,valores.password)
      const r = await singUpWithPassword(form.email,form.password)
      console.log('respuesta',r);
    } catch (error) {
      console.log(error);
      setError(error.message)
    }
  }

  const loginOk = async(e)=>{
    e.preventDefault()
    console.log('login',form);
    try {
      const r = await signInWithEmail(form.email,form.password)
      console.log('respuesta',r);
    } catch (error) {
      console.log(error);
      setError(error.message)
    }
  }

  const handleChange = ({target:{value,name}})=>{
    // console.log('cambiando',value,name);
    setForm({...form,[name]:value})
  }
  
  return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color="primary.main">
            Iniciar Sesión
          </Typography>
          {error && <Alert severity="error">{error}</Alert>} 
          <Box component="form" onSubmit={loginOk} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleChange}
              variant='standard'
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
              variant='standard'
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              ><LockOpen/> Ingresar
            </Button>
            <Button type='button' title='Iniciar con Google' fullWidth onClick={signInWithGoogle} variant="outlined" color='error' sx={{ mt: 1, mb: 2 }}><Google/> oogle</Button>
            <Button type='button' title='Registrarte' fullWidth onClick={signUp} variant="contained" color='secondary' sx={{ mt: 1, mb: 2 }}><HowToReg/> Regístrate</Button>
            {/* <Grid container sx={{mt:2}}>
              <Grid item xs>
                <Link sx={{cursor:'pointer'}} onClick={handleResetPassword} variant="body2">
                  Olvidaste tu Contraseña
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"No tienes cuenta? Regístrate"}
                </Link>
              </Grid>
            </Grid> */}
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
  )
}
