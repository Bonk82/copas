import { Alert, Backdrop, Box, CircularProgress, IconButton, Slide, Snackbar, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useState } from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import alasql from "alasql";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import dayjs from "dayjs";
import { useSupa } from "../context/SupabaseContext";
import { esES } from "@mui/x-data-grid/locales";
import { UserAuth } from "../context/AuthContext";

let apuestasAll = [];
let partidosAll = [];

export const Bet = () => {
  const { loading,createReg,partidos,apuestas,getReg,updateReg } = useSupa();
  const {usuario} = UserAuth();
  const [losPartidos, setLosPartidos] = useState([])
  const [lasApuestas, setLasApuestas] = useState([]);
  const [alerta, setAlerta] = useState([false,'success','']);
  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:''});

  useEffect(() => {
    console.log('los partidos',losPartidos);
    if(partidos.length == 0) cargarData();
    if(partidos.length > 0){
      partidosAll = [...partidos];
      apuestasAll = [...apuestas];
      armaGrillas();
    } 
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarData = async () =>{
    partidosAll = await getReg('vw_partido','id_partido',false);
    apuestasAll = await getReg('vw_apuesta','id_apuesta',false);
    console.log(`despues de `,partidosAll,apuestasAll);
    armaGrillas();
  }

  const onApuesta = async (e)=>{
    console.log('onApuesta',e);
    if(dayjs(e.fecha).add(-10,'minutes') <= dayjs()){
      setAlerta([true,'error','Ya no se permiten apuestas para este Parido!']);
      return true;
    }
    try {
      const nuevoObj  = {scorea:Number(e.beta),scoreb:Number(e.betb),fid_partido:e.id_partido,usuario_apuesta:usuario.id}
      if(e.id_apuesta){
        nuevoObj.id_apuesta = e.id_apuesta
        await updateReg('apuesta',nuevoObj);
        // console.log('apuesta actualizada',nuevoObj);
        setAlerta([true,'success','Apuesta actualizada, suerte!'])
        cargarData();
      }else{
        await createReg(nuevoObj,'apuesta');
        // console.log('apuesta registrada',nuevoObj);
        setAlerta([true,'success','Apuesta registrada, suerte!'])
        cargarData();
      }
    } catch (error) {
      setAlerta([true,'danger','No se pudo registrar tu apuesta'])
    }
  }

  const armaGrillas = async()=>{
    let part = [...partidosAll];
    let bet = [...apuestasAll];
    bet = bet.filter(f=>f.usuario_apuesta==usuario.id)
    console.log('la bet',bet,part);
    part.map(e=>{
      e.fechaPartidoStr = dayjs(e.fecha).format('DD/MMM HH:mm');
      e.activo = dayjs(e.fecha).add(-10,'minutes') <= dayjs() || e.finalizado ? 0 : 1 ;//TODO: cambiar days x minutes 
      e.beta = bet.filter(f=>f.id_partido === e.id_partido)[0]?.beta || 0;
      e.betb = bet.filter(f=>f.id_partido === e.id_partido)[0]?.betb || 0;
      e.id_apuesta = bet.filter(f=>f.id_partido === e.id_partido)[0]?.id_apuesta;
      e.puntaje = bet.filter(f=>f.id_partido === e.id_partido)[0]?.puntaje || 0;
      return e
    })

    let pivotPasado = part.filter(f=>f.activo === 0);
    let pivotActivos = part.filter(f=>f.activo === 1);

    // let respi = resp.sort((a,b)=> new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    pivotActivos = await alasql('select * from ? order by [fecha]',[pivotActivos]);
    pivotPasado = await alasql('select * from ? order by [fecha] desc',[pivotPasado]);
    console.log('partidos y apuestas', pivotPasado,pivotActivos);
    setLosPartidos(pivotPasado);
    setLasApuestas(pivotActivos);
    setGrilla({mostrar:true,filas:pivotActivos,columnas:colApuestas,tipo:'Apostar'})
  }

  const colPartidos = [
    {field:'puntaje',headerName:'Puntos', minWidth:40,flex:1,type:'number',
      renderCell:(params)=>{ return <Typography variant="h4" style={{display:'grid',placeItems:'center',marginTop:'0.5rem'}}>{params.row.puntaje}</Typography>}
    },
    {field:'fid_equipoa',headerName:'Equipo', minWidth:90, flex:1, align:'center'
    , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipoa}`} width='50' src={`../assets/${params.row.codigoa}.png`} alt='X'/>
      <figcaption >{`${params.row.equipoa}`} : {`${params.row.scorea}`}</figcaption>
    </figure>},
    {field:'beta',headerName:'Goles',editable:false, minWidth:40,flex:1,
      renderCell:(params)=>{ return <Typography variant="h4" style={{display:'grid',placeItems:'center',marginTop:'0.5rem'}}>{params.row.beta}</Typography>}
    },
    {field:'betb',headerName:'Goles',editable:false, minWidth:40,flex:1,
      renderCell:(params)=>{ return <Typography variant="h4" style={{display:'grid',placeItems:'center',marginTop:'0.5rem'}}>{params.row.betb}</Typography>}
    },
    {field:'fid_equipob',headerName:'Equipo', minWidth:90, flex:1, align:'center'
    , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipob}`} width='50' src={`../assets/${params.row.codigob}.png`} alt='X'/>
      <figcaption >{`${params.row.equipob}`} : {`${params.row.scoreb}`}</figcaption>
    </figure>},
    {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1}
  ]

  const colApuestas = [
    {field: 'Apostar', headerName: 'Apostar', sortable: false, minWidth:50,flex:1,
      renderCell: (params) => {
        return <IconButton onClick={()=>onApuesta(params.row)} title='Apostar' color={params.row.id_apuesta? 'success':'error'}>
                {params.row.id_apuesta? <CheckCircleIcon fontSize="large"/>:<SaveAsIcon fontSize="large"/>} 
              </IconButton>;
      },
    },
    {field:'fid_equipoa',headerName:'Equipo', minWidth:90, flex:1, align:'center'
    , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipoa}`} width='50' src={`../assets/${params.row.codigoa}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoa}`}</figcaption>
    </figure>},
    {field:'beta',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number',min:0,max:9,align:'center',
      renderCell:(params)=>{return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.beta}</Typography>}
    },
    {field:'betb',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number',
      renderCell:(params)=>{ return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.betb}</Typography>}
    },
    {field:'fid_equipob',headerName:'Equipo', minWidth:90, flex:1, align:'center', 
    renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipob}`} width='50' src={`../assets/${params.row.codigob}.png`} alt='X'/>
      <figcaption>{`${params.row.equipob}`}</figcaption>
    </figure>},
    {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1,editable:false},
    {field:'id_partido',headerName:'ID'},
    {field:'id_apuesta',headerName:'apuestaID'},
    {field:'activo',headerName:'Activo'},
  ]

  const handleClose = ()=>{
    setAlerta([false,'success','vacio']);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }

  const buttons = [
    <ToggleButton  key="apuestasDisponibles" value='Apostar' onClick={()=>cargarGrilla('Apostar')}>Apostar</ToggleButton>,
    <ToggleButton  key="userApuestas" value='Historial Personal' onClick={()=>cargarGrilla('Historial Personal')}>Historial Personal</ToggleButton>,
    <ToggleButton  key="fechaApuestas" value='Apuestas del Grupo' onClick={()=>cargarGrilla('Apuestas del Grupo')}>Apuestas del Grupo</ToggleButton>
  ];

  const cargarGrilla = async (tipo)=>{
    // console.log(tipo);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:'',orden:{}})
    }else{
      let columnas =[];
      let filas =[];
      if(tipo==='Apostar'){
        console.log('apostar filas',lasApuestas);
        filas = lasApuestas; 
        columnas = colApuestas;
      }
      if(tipo==='Historial Personal'){
        // console.log('pinches partidos',losPartidos);
        console.log('Historial filas',losPartidos);
        filas = losPartidos; 
        columnas = colPartidos;
      }
      if(tipo==='Apuestas del Grupo'){
        // usuariosAll = await getReg('usuario');//ya no
        // partidosAll = await getReg('partido') //homologar todo esto desde vw_apuestas
        // filas = await alasql(`select a.id, a.scorea beta, a.scoreb betb, a.uid,p.fid_equipoa,p.fid_equipob,p.fecha,u.nombre
        // from ? a inner join ? p on a.partidoID = p.id inner join ? u on a.uid = u.userID
        // where u.grupo = '${usuario.grupo}' order by p.fecha.toDate(), u.nombre`,[apuestasAll,partidosAll,usuariosAll]);
        console.log('en grupo apuestas',apuestas);
        // filas = apuestas.filter(f=>dayjs(f.fecha).toDate() < dayjs().toDate());
        filas = apuestas
        // filas = await filas.sort((a,b)=>b.fecha - a.fecha)

        columnas = [
          {field:'email',headerName:'Usuario', minWidth:120,flex:1},
          {field:'equipoa',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.equipoa}`} width='50' src={`../assets/${params.row.codigoa}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoa}`}</figcaption>
          </figure>},
          {field:'beta',headerName:'Goles',editable:false, minWidth:40,flex:1,align:'center', renderCell:(params)=>{
            return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.beta}</Typography>
          }},
          {field:'betb',headerName:'Goles',editable:false, minWidth:40,flex:1, renderCell:(params)=>{
            return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.betb}</Typography>
          }},
          {field:'equipob',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.equipob}`} width='50' src={`../assets/${params.row.codigob}.png`} alt='X'/>
            <figcaption>{`${params.row.equipob}`}</figcaption>
          </figure>},
          {field:'id_apuesta',headerName:'ID'}
        ]
      }
      setGrilla({mostrar:true,filas,columnas,tipo})
    }
  }



  return (
    <>
      <Box component='main' sx={{backgroundColor:'whitesmoke',width:'100vw'}} >
        <Box sx={{display: 'flex',flexDirection: 'column',justifyContent:'center', alignItems: 'center','& > *': {m: 1, }}}>
          <ToggleButtonGroup size="large" value={grilla.tipo} color="primary" sx={{fontWeight:'bold'}} aria-label="Platform" exclusive >
            {buttons}
          </ToggleButtonGroup>
        </Box>
        {grilla.mostrar && 
          <Box sx={{ height:{xs:600,md:800}, display:'flex',justifyContent:'center',flexDirection:'column',paddingX:{xs:0.5,md:40} }}>
            <Typography variant="h5" sx={{fontWeight:500,backgroundColor:'secondary.main',color:'persist.main',borderRadius:2,pl:4,mb:1}} >{grilla.tipo}</Typography>
            <DataGrid
              autoHeight
              getRowId={(row) =>  ['Apostar','Historial Personal'].includes(grilla.tipo) ? row.id_partido : row.id_apuesta}
              rows={grilla.filas}
              columns={grilla.columnas}
              pageSize={10}
              density="compact"
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[5,10,25]}
              disableSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
              columnVisibilityModel={{id_partido:false,id_apuesta:false,activo:false}}
              rowHeight={70}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>}
      </Box>
      <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
      </Snackbar>
      <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 100 }} open={loading}>
        <CircularProgress color="inherit" size='7rem' thickness={5} />
      </Backdrop>
    </>
  )
}
