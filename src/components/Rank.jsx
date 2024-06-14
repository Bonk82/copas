
import { Backdrop, Box, Button, CircularProgress, IconButton, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import alasql from "alasql"
import { useEffect } from "react"
import { useState } from "react"
import { Navbar } from "./Navbar"
import MoneyIcon from '@mui/icons-material/Money';
import { Barras } from "../charts/Barras"
import { Linea } from "../charts/Linea"
import BarChartIcon from '@mui/icons-material/BarChart';
import dayjs from "dayjs"
import { useSupa } from "../context/SupabaseContext"
import { esES } from "@mui/x-data-grid/locales"

let historialAll = [];

export const Rank = () => {
  const { loading,usuario,createReg,parametricas,pedidos,pedidosDetalle,clientes,productos,getReg,getRegFilter,updateReg,deleteReg } = useSupa();
  const [apostadores, setApostadores] = useState([]);
  const [dataChart, setDataChart] = useState({x:[],y:[],titulos:{},naame:''})
  const [dataChartLine, setDataChartLine] = useState({x:[],y:[],titulos:{},naame:''})
  const [openSpinner, setOpenSpinner] = useState(false);
  const [historial, setHistorial] = useState(false);

  useEffect(() => {
    cargarApostadores();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarApostadores = async()=>{
    setOpenSpinner(true);
    const apuestas = await getReg('apuesta');
    const usuarios = await getReg('usuario');
    const partidos = await getReg('partido');
    historialAll = alasql(`select a.scorea betA,a.scoreb betB, a.uid id,a.puntos,u.nombre,u.estado,p.equipoA,p.equipoB
    ,p.fechaPartido.toDate() fechaPartido,p.scorea,p.scoreb from ? u inner join ? a on u.userID =  a.uid
    inner join ? p on p.id = a.partidoID where u.estado = 'apuesta' and u.grupo = '${usuario.grupo}'`,[usuarios,apuestas,partidos]);

    const apostadoresAll = await alasql('SELECT nombre,id,SUM(puntos)puntos from ? GROUP BY nombre,id order by 3 desc',[historialAll]);
    // const rr = alasql('SELECT nombre,id,SUM(puntos)puntos from ? GROUP BY nombre,id',[historialAll]);
    //console.log('apostadores',apostadoresAll,historialAll,apuestas,usuarios,partidos,rr);
    // console.log('ver',apostadoresAll);
    setApostadores(apostadoresAll);
    cargarDataChart(apostadoresAll)
  }

  const cargarHistorial = async(row) =>{
    setOpenSpinner(true);
    // console.log(row);
    // const misApuestas = historialAll.filter(f=>f.id === row.id)
    const historialUsuario = await alasql(`select CONVERT(STRING,DATE(fechaPartido),112) fechaPartido,sum(puntos) puntos from ? where id='${row.id}' group by CONVERT(STRING,DATE(fechaPartido),112) order by [fechaPartido]`,[historialAll]) //historialAll.filter(f=>f.id === row.id)
    // console.log('flag',historialUsuario,apostadores,misApuestas);
    let pts =[];
    let fechas = [];
    let puntosDia =0;
    // historialUsuario = await historialUsuario.sort((a,b)=> a.fechaPartido.toDate() - b.fechaPArtido.toDate())
    historialUsuario.forEach(a => {
      if(puntosDia===0) puntosDia = a.puntos
      pts.push(a.puntos || 0);
      fechas.push(dayjs(a.fechaPartido).format('DD/MMM'));
    });
    setDataChartLine({x:fechas,y:pts,titulos:{x:'Fechas',y:'Puntos Obtenidos',c:'Historial Personal - '+ row.nombre},name:row.nombre})
    setHistorial(true);
    setOpenSpinner(false);
  }

  const colApostadores = [
    {field:'nombre',headerName:'Nombre', minWidth: 150,flex:1},
    {field:'puntos',headerName:'Puntos', minWidth: 80,flex:1,type:'number'},
    {field: 'Acciones', headerName: 'Historial', sortable: false, minWidth: 80,flex:1,
    renderCell: (params) => {
      return <IconButton onClick={()=>cargarHistorial(params.row)} title='Historial Apuestas' color='success'><MoneyIcon fontSize="large"/></IconButton>;
      },
    },
    {field:'id',headerName:'ID', width: 80},
  ]

  const cargarDataChart = (data)=>{
    // console.log('la data',data);
    const users = [];
    const pts = [];
    
    data.forEach(d => {
      // console.log('bets',d);
      users.push(d.nombre);
      pts.push(Number(d.puntos.toFixed(2)));
    });
    setDataChart({x:users,y:pts,titulos:{x:'Participantes',y:'Puntos Obtenidos',c:'Ranking de Apostadores'},name:''})
    setOpenSpinner(false);
  }

  const onChangeChart = ()=>{
    setHistorial(false)
  }



  return (
    <>
      {/* <Navbar/> */}
      <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:2}} >
        <Box sx={{ height:{xs:400, md:550}, width:{xs:'100vw',md:400},justifyContent:'center',mt:1,paddingX:{xs:0.5,md:4} }}>
          <Typography variant="h5" color='persist.main' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}} >Ranking</Typography>
          <DataGrid
            rows={apostadores}
            columns={colApostadores}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{id:false}}
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            sx={{fontSize:16,mb:1}}
          />
          <Button color="secondary" sx={{color:'#56042c'}} variant="contained" fullWidth onClick={onChangeChart} endIcon={<BarChartIcon/> }>Ranking General</Button>
        </Box>
        <Box component="div" sx={{alignItems:'center',width:{xs:'100vw',md:900},height:{xs:450,md:800},mt:1,pt:{xs:8,md:2}}}>
          {(apostadores.length>0 && !historial) && <Barras data={dataChart}></Barras>}
          {historial && <Linea data={dataChartLine}></Linea>} 
        </Box>
    </Box>
    <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
      <CircularProgress color="inherit" size='7rem' thickness={5} />
    </Backdrop>
    </>
  )
}
