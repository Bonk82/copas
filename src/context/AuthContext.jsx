import {createContext, useContext, useEffect, useState} from 'react'
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext()

// // eslint-disable-next-line react-refresh/only-export-components
// export function useAuth() {
//   return useContext(AuthContext)
// }


// eslint-disable-next-line react/prop-types
export const AuthContextProvider =({children})=> {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({})
  const [avatar, setAvatar] = useState('');
  const [pages, setPages] = useState(['Partidos', 'Apuestas', 'Puestos'])

  // useEffect(() => {
  //   getUser()
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])
  

  const loginWithMagicLink = async (email) => {
    try {
      const { error } = await supabase.auth.signIn({ email });
      if (error) throw new Error('revisa tu correo para usar el enlace de registro');
      console.log("loginWithMagicLink",error);
    } catch (error) {
      console.log(error.message);
    }
  };

  const singUpWithPassword = async (email,password)=>{
    try {
      const {data,error} = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.log(error,email,password);
    }
  }

  const signInWithEmail = async(email,password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('respuesta signInWithPassword',data,error);
      if(error) throw new Error(error.message);
      return data
    } catch (error) {
      console.log(error.message);
    }
  };

  const signInWithGoogle = async ()=> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if(error) throw new Error(error.message)
      console.log('la data',data,error);
      return data 
    } catch (error) {
      console.log(error.message);
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message)
    } catch (error) {
      console.log(error);
    }
  };

  // const getUser = async () =>{
  //   try {
  //     const pivotUser = await supabase.auth.getUser();
  //     console.log('ingresando',pivotUser);
  //     if(!pivotUser.data.user){
  //       navigate('/login')
  //       return false;
  //     } 
  //     pivotUser.data.user?.identities.forEach(e => {
  //       e.identity_data.picture ? setAvatar(e.identity_data.picture):'C'
  //       // console.log('entroEach',avatar);
  //     });

  //     // if(pivotUser.data.user)  navigate('/')
  //     if(['bonkalvarado@gmail.com','codigoid@hotmail.com'].includes(pivotUser.data.user.email)){
  //       pivotUser.data.user.role =  'admin'
  //     // if(pivotUser.data.user.role == 'admin'){
  //       const p = ['Fixture', 'Apuestas', 'Ranking','Admin'];
  //       setPages(p)
  //     }else{
  //       pivotUser.data.user.role = 'usuario';
  //     }
  //     if (pivotUser.data.user){
  //       // getReg('vw_menu_rol','id_menu','asc')
        
  //       setUsuario(pivotUser.data.user)
  //       navigate('/')
  //     } 
  //   } catch (error) {
  //     console.log('error al cargar usuario',error);
  //   }
  // }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("supabase event: ", event,session);
        if (session == null) {
          navigate('/login');
        } else {
          // setUsuario(session?.user.user_metadata);
          const { user } = session;
          console.log("data del usuario", session?.user.user_metadata);
          // insertarUsuarios(user.id, user.user_metadata);
          user.identities.forEach(e => {
            e.identity_data.picture ? setAvatar(e.identity_data.picture):'U'
          });
          if(['bonkalvarado@gmail.com','codigoid@hotmail.com','testbvirreyra@gmail.com','vlcyamil@gmail.com'].includes(user.email)){
            setPages( ['Partidos', 'Apuestas', 'Puestos','Admin'])
            user.role = 'admin';
          } 
          setUsuario(user)
          navigate('/');
        }
      }
    );
    return () => {
      authListener.subscription;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const insertarUsuarios = async (idauth_supabase, dataProveedor) => {
  //   const p = {
  //     nombres: dataProveedor.name,
  //     foto: dataProveedor.picture,
  //     celular: "-",
  //     correo: dataProveedor.email,
  //     idauth_supabase: idauth_supabase,
  //   };
  //   console.log("idauth_supabase ....", idauth_supabase);
  //   // await InsertarUsuarios(p);
  //   setUsuario(p)
  // };

  return (
    <AuthContext.Provider value={{ signInWithGoogle, logout, usuario,signInWithEmail,singUpWithPassword,loginWithMagicLink,avatar,pages }}>
      {children}
    </AuthContext.Provider>
  );
}

export const UserAuth = () => {
  return useContext(AuthContext);
};
  // return (
  //     <AuthContext.Provider value={{
  //         usuario: 'bonk',
  //     }}>
  //         {children}
  //     </AuthContext.Provider>
  // )
// }