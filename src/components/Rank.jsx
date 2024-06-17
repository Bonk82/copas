
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
  const { loading,apuestas,getReg } = useSupa();
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
    const lasApuestas = apuestas.length>0 ? apuestas : await getReg('vw_apuesta','id_apuesta',false);
    // const usuarios = await getReg('usuario');
    // const partidos = await getReg('partido');
    // historialAll = alasql(`select a.scorea betA,a.scoreb betB, a.uid id,a.puntos,u.nombre,u.estado,p.equipoA,p.equipoB
    // ,p.fechaPartido.toDate() fechaPartido,p.scorea,p.scoreb from ? u inner join ? a on u.userID =  a.uid
    // inner join ? p on p.id = a.partidoID where u.estado = 'apuesta' and u.grupo = '${usuario.grupo}'`,[usuarios,apuestas,partidos]);

    const apostadoresAll = await alasql('SELECT email,usuario_apuesta,coalesce(SUM(puntaje),0)puntos from ? GROUP BY email,usuario_apuesta order by 3 desc',[lasApuestas]);
    console.log('los apostadores',apostadoresAll,lasApuestas);
    setApostadores(apostadoresAll);
    cargarDataChart(apostadoresAll)
  }

  const cargarHistorial = async(row) =>{
    setOpenSpinner(true);
    // console.log(row);
    // const misApuestas = historialAll.filter(f=>f.id === row.id)
    const historialUsuario = await alasql(`select CONVERT(STRING,DATE(fecha),112) fechaPartido,sum(puntaje) puntos from ? where usuario_apuesta='${row.usuario_apuesta}' group by CONVERT(STRING,DATE(fecha),112) order by [fecha]`,[apuestas]) //historialAll.filter(f=>f.id === row.id)
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
    setDataChartLine({x:fechas,y:pts,titulos:{x:'Fechas',y:'Puntos Obtenidos',c:'Historial Personal - '+ row.email},name:row.email})
    setHistorial(true);
    setOpenSpinner(false);
  }

  const colApostadores = [
    {field:'email',headerName:'Nombre', minWidth: 150,flex:1},
    {field:'puntos',headerName:'Puntos', minWidth: 80,flex:1,type:'number'},
    {field: 'Acciones', headerName: 'Historial', sortable: false, minWidth: 80,flex:1,
    renderCell: (params) => {
      return <IconButton onClick={()=>cargarHistorial(params.row)} style={{marginTop:-10}}
      title='Historial Apuestas' color='success'><MoneyIcon fontSize="large"/></IconButton>;
      },
    },
    {field:'usuario_apuesta',headerName:'ID', width: 80},
  ]

  const cargarDataChart = (data)=>{
    // console.log('la data',data);
    const users = [];
    const pts = [];
    
    data.forEach(d => {
      // console.log('bets',d);
      users.push(d.email);
      pts.push(Number((d.puntos)).toFixed(2));
    });
    setDataChart({x:users,y:pts,titulos:{x:'Participantes',y:'Puntos Obtenidos',c:'Ranking de Apostadores'},nombre:''})
    setOpenSpinner(false);
  }

  const onChangeChart = ()=>{
    setHistorial(false)
  }



  return (
    <>
      <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:'100vw',display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',gap:1}} >
        <Box sx={{ height:{xs:400, md:550}, width:{xs:'100vw',md:450},justifyContent:'center',mt:1,paddingX:{xs:0.5,md:4} }}>
          <Typography variant="h5" color='persist.main' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}} >Ranking</Typography>
          <DataGrid
            autoHeight
            rows={apostadores}
            getRowId={(row) => row.usuario_apuesta}
            columns={colApostadores}
            pageSize={10}
            density="compact"
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5,10,25]}
            disableSelectionOnClick
            experimentalFeatures={{ newEditingApi: true }}
            columnVisibilityModel={{usuario_apuesta:false}}
            // sortModel={[{field:'fechaPartido'}]}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            sx={{fontSize:16,mb:1}}
          />
          <Button color="secondary" sx={{color:'whitesmoke'}} variant="contained" fullWidth onClick={onChangeChart} endIcon={<BarChartIcon/> }>Ranking General</Button>
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
