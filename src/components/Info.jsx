import { Backdrop, Box, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { DataGrid} from "@mui/x-data-grid";
import alasql from "alasql";
import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar"
import dayjs from "dayjs";
import { useSupa } from "../context/SupabaseContext";
import { esES } from "@mui/x-data-grid/locales";

// const [dtsResultados, setDtsResultados] = useState([]);
// const [dtsPosiciones,setDtsPosiciones]=useState([]);
// const dinamico=[];

export const Info = () => {
  const { loading,usuario,createReg,parametricas,pedidos,pedidosDetalle,clientes,productos,getReg,getRegFilter,updateReg,deleteReg } = useSupa();
  const buttons = [
    <ToggleButton  key="resultados" value='resultados' onClick={()=>cargarGrilla('resultados')}>Resultados</ToggleButton>,
    <ToggleButton  key="posiciones" value='posiciones' onClick={()=>cargarGrilla('posiciones')}>Posiciones</ToggleButton>,
    <ToggleButton  key="dinamico" value='dinamico' onClick={()=>cargarGrilla('dinamico')}>Dinámico</ToggleButton>
  ];

  // const {tipoUsuario}= useAuth()

  const [grilla, setGrilla] = useState({mostrar:false,filas:[],columnas:[],tipo:''});
  const [openSpinner, setOpenSpinner] = useState(false);

  const cargarGrilla = async (tipo)=>{
    // console.log(tipo,tipoUsuario);
    setOpenSpinner(true);
    if(grilla.tipo === tipo){
      setGrilla({mostrar:false,filas:[],columnas:[],tipo:''})
      setOpenSpinner(false);
    }else{
      let columnas =[];
      let filas =[];
      let resultados = [];
      if(tipo==='resultados'){
        resultados = await getReg('vw_partido','fecha',false);
        resultados.map(e=>{
          e.fechaPartidoStr = dayjs(e.fecha).format('DD/MMM HH:mm');
          return e
        })
        // filas = resultados.filter(f=>f.finalizado)
        //                   .sort((a,b)=>new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
        filas = alasql('select * from ? where finalizado = true order by fecha',[resultados])
        columnas = [
          {field:'fechaPartidoStr',headerName:'Fecha', minWidth:100,flex:1},
          {field:'equipoa',headerName:'Equipo', minWidth:90, flex:0.5, align:'center'
          , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.equipoa}`} width='50' src={`../assets/${params.row.codigoa}.png`} alt='X'/>
            <figcaption>{`${params.row.equipoa}`}</figcaption>
          </figure>},
          {field:'scorea',headerName:'Goles', minWidth:50,flex:1 ,type:'number'},
          {field:'equipob',headerName:'Equipo',minWidth:90, flex:0.5, align:'center'
          , renderCell: (params) => <figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.equipob}`} width='50' src={`../assets/${params.row.codigob}.png`} alt='X'/>
            <figcaption>{`${params.row.equipob}`}</figcaption>
          </figure>},
          {field:'scoreb',headerName:'Goles', minWidth:50,flex:1 ,type:'number'},
        ] ;
      }
      if(tipo==='posiciones'){
        resultados = await getReg('equipo','nombre',false);
        filas = alasql('select * from ? order by grupo,puntos desc,diferencia desc',[resultados])
        // console.log(filas);
        columnas = [
          {field:'grupo',headerName:'Grupo', minWidth:50,flex:1},
          {field:'nombre',headerName:'Equipo', minWidth:90, flex:1, align:'center'
          , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.nombre}`} width='50' src={`../assets/${params.row.codigo}.png`} alt='X'/>
            <figcaption>{`${params.row.nombre}`}</figcaption>
          </figure>},
          {field:'jugados',headerName:'PJ',  minWidth:50,flex:1,type:'number'},
          {field:'ganados',headerName:'PG',  minWidth:50,flex:1,type:'number'},
          {field:'empatados',headerName:'PE',  minWidth:50,flex:1,type:'number'},
          {field:'perdidos',headerName:'PP',  minWidth:50,flex:1,type:'number'},
          {field:'favor',headerName:'GF',  minWidth:50,flex:1,type:'number'},
          {field:'contra',headerName:'GC',  minWidth:50,flex:1,type:'number'},
          {field:'diferencia',headerName:'GD',  minWidth:50,flex:1,type:'number'},
          {field:'puntos',headerName:'PTS',  minWidth:50,flex:1,type:'number'},
        ] ;
      }
      if(tipo==='dinamico'){
        resultados = await getReg('equipo','nombre',false);
        filas = resultados.map(e=>{
          e.nivel = e.nivel.replace('$','')/100;
          return e
        });
        columnas = [
          {field:'nombre',headerName:'Equipo', minWidth:110, flex:1, align:'center'
          , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
            <img title={`${params.row.nombre}`} width='50' src={`../assets/${params.row.codigo}.png`} alt='X'/>
            <figcaption>{`${params.row.nombre}`}</figcaption>
          </figure>},
          {field:'nivel',headerName:'Factor', width: 100},
        ] ;
      }
      setGrilla({mostrar:true,filas,columnas,tipo})
      setOpenSpinner(false);
    }
  }

  return (
    <>
    {/* <Navbar/> */}
      <Box component='main' sx={{textAlign:'center',backgroundColor:"whitesmoke",width:'100vw'}} >
        <Box sx={{display: 'flex',flexDirection: 'column', alignItems: 'center','& > *': {m: 1, }}}>
          <ToggleButtonGroup size="large" value={grilla.tipo} color="primary" sx={{fontWeight:'bold'}} aria-label="Platform" exclusive >
            {buttons}
          </ToggleButtonGroup>
        </Box>
        {!grilla.mostrar && <Box sx={{display:'flex',justifyContent:'center'}}>
          <Box sx={{width:{xs:'100%',md:'80%'}}} >
            <img src="../assets/fixture.jpg" alt="Cargando Imagen" width='100%' />
          </Box>
        </Box>}
        {grilla.mostrar && <Box sx={{display:'flex',justifyContent:'center'}}>
          <Box sx={{width:{xs:'100%',md:'80%'},height: '85vh'}} >
          <DataGrid
              rows={grilla.filas}
              getRowId={(row) => row.id_partido || row.id_equipo}
              columns={grilla.columnas}
              pageSize={10}
              density="compact"
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              pageSizeOptions={[5,10,25]}
              disableSelectionOnClick
              autoHeight
              rowHeight={70}
              experimentalFeatures={{ newEditingApi: true }}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              // sortModel={grilla.orden}
            />
          </Box>
        </Box>}
      </Box>
      <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
        <CircularProgress color="inherit" size='7rem' thickness={5} />
      </Backdrop>
    </>
  )
}
