'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";
// import { useRouter } from "next/navigation";

export const SupaContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSupa = () => {
  const context = useContext(SupaContext);
  if (context === undefined) {
    throw new Error("No existe un Provider");
  }
  return context;
};

// eslint-disable-next-line react/prop-types
export const SupabaseContextProvider = ({ children }) => {
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [apuestas, setApuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [avatar, setAvatar] = useState('');
  // const [usuario, setUsuario] = useState(null);

  // const [pages, setPages] = useState(['Fixture', 'Apuestas', 'Ranking'])


  // const router = useRouter()
  // const navigate = useNavigate();

  
  // useEffect(()=>{
  //   getUser();
  //   // getReg('parametrica','nombre',true)
  //   // if(!usuario) router.push('/login')
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[])

  const createReg = async (reg,table) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.from(table).insert(reg).select();
      console.log('llega aca',error,data,reg,table);
      if (error) throw new Error(error.message);
      // if(!error && table == 'cliente') setClientes(data);
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getReg = async (table,col,ascending) => {
    try {
      setLoading(true);
      const {data, error}  = await supabase
        .from(table)
        .select("*")
        .order(col, { ascending})
      console.log(table,data,error);
      if (error) throw new Error(error.message);
      if(table == 'equipo') setEquipos(data);
      if(table == 'partido') setPartidos(data);
      if(table == 'apuesta') setApuestas(data);
      if(table == 'vw_partido') setPartidos(data);
      if(table == 'vw_apuesta') setApuestas(data);
      return data;
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRegFilter = async (table,col,value,type,value2) => {
    console.log('lo q llega',table,col,value,type,value2);
    try {
      setLoading(true);
      let respuesta;
      if(type=='eq'){
       respuesta = await supabase
          .from(table)
          .select("*")
          .eq(col,value)
          .order('id_'+table.replace('vw_',''),{ ascending: true })
      }
      if(type=='between'){
        respuesta = await supabase
          .from(table)
          .select("*")
          .gte(col, value)
          .lte(col, value2)
          .order('id_'+table.replace('vw_',''),{ ascending: true })
       }

      const {data, error} = respuesta
      console.log(table,data,error);
      if (error) throw new Error(error.message);
      // if(table == 'vw_pedido_detalle') setPedidosDetalle(data);
      // if(table == 'vw_transaccion') setTransacciones(data);
      return data;
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReg = async (tabla, updatedFields) => {
    try {
      setLoading(true);
      // const user = supabase.auth.user();
      console.log('actualizando',updatedFields);
      const { error, data } = await supabase
        .from(tabla)
        .update(updatedFields)
        .eq("id_"+tabla, updatedFields['id_'+tabla]);
      if (error) throw new Error(error.message);
      console.log(error,data);
    } catch (error) {
      console.log(error.error_description || error.message || error);
      throw new Error(error.message);
    } finally {
      setLoading(false)
    }
  };

  const deleteReg = async (tabla,id) => {
    console.log('deletereg',tabla,id);
    try {
      setLoading(true)
      const {error} = await supabase
        .from(tabla)
        .delete()
        .eq("id_"+tabla, id);
      if (error) throw new Error(error.message);
      // setClientes(clientes.filter(c => c.id !== id));
    } catch (error) {
      console.log(error.error_description || error.message);
      throw new Error(error.message);
    } finally {
      setLoading(false)
    }
  };

  return (
    <SupaContext.Provider
      value={{
        equipos,
        partidos,
        apuestas,
        loading,
        setLoading,
        createReg,
        getReg,
        getRegFilter,
        updateReg,
        deleteReg,
      }}
    >
      {children}
    </SupaContext.Provider>
  );
};
