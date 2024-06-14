import dayjs from "dayjs";
import { Alert, Backdrop, Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, Slide, Snackbar, TextField, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { esES as esFechas } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect } from "react";
import { useState } from "react"
// import {  } from "../context/SupabaseContext";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from "react-router-dom";
import { useSupa } from "../context/SupabaseContext";
import { esES } from "@mui/x-data-grid/locales";

let apuestasAll = [];

dayjs.extend(utc);
dayjs.extend(timezone);

export const Admin = () => {
  const { loading,usuario,createReg,partidos,equipos,getReg,getRegFilter,updateReg,deleteReg } = useSupa();
  const navigate = useNavigate();
  // const [isAdmin, setIsAdmin] = useState(false)
  // const [partidos, setPartidos] = useState([])
  // const [equipos, setEquipos] = useState([]);
  const [partido, setPartido] = useState({
    fid_equipoa:'',scorea:0,
    fid_equipob:'',scoreb:0,
    fecha:dayjs().toDate(),
    finalizado:false,
    torneo:'EURO COPA',
    usuario_registro:usuario.id,
  });
  const [alerta, setAlerta] = useState([false,'success','']);
  const [openSpinner, setOpenSpinner] = useState(false);
  // const [torneo, setTorneo] = useState('EURO COPA')

  // useEffect(() => {
  //   (usuario.role !== 'admin') ? navigate('/'): setIsAdmin(true);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])
  
  useEffect(() => {
    console.log('entra efect admin',equipos);
    if(usuario.role !== 'admin') navigate('/')
    // if(usuario.role === 'admin'){
    //   setIsAdmin(true);
    //   cargarEquipos();
    // } 
    if(equipos.length==0) cargarEquipos();
    if(partidos.length==0) listarPartidos();
    listarApuestas();

    // listarPartidos();
    // listarApuestas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChangeScore = async (e)=>{
    setOpenSpinner(true);
    // console.log('score',e);
    try {
      const nuevoObj  = {scorea:Number(e.scorea),scoreb:Number(e.scoreb),finalizado:true,id_partido:e.id_partido}
      await updateReg('partido',nuevoObj);
      await actualizarPuntuacion(e);
      puntarBet(e)
      // console.log('ya se actualizo');
    } catch (error) {
      setAlerta([true,'danger','Error al actualizar marcador'])
    } finally{
      await listarPartidos();
      setAlerta([true,'success','Marcador actualizado con éxito!'])
      setOpenSpinner(false);
    }
  }

  const actualizarPuntuacion = async (data) =>{
    console.log('actualizarPuntuacion',data);
    let ptsA=0;
    if(data.scorea > data.scoreb) ptsA=3;
    if(data.scorea === data.scoreb) ptsA=1;
    //para equipo A
    let elEquipo = equipos.filter(f=>f.nombre === data.equipoa)[0];
    let equipoAct = {
      jugados : parseInt(elEquipo.jugados || 0)+1,
      ganados : parseInt(elEquipo.ganados || 0) + ptsA===3?1:0,
      empatados : parseInt(elEquipo.empatados || 0) + ptsA===1?1:0,
      perdidos : parseInt(elEquipo.pertidos || 0) + ptsA===0?1:0,
      favor : parseInt(elEquipo.favor || 0) + data.scorea,
      contra : parseInt(elEquipo.contra || 0) + data.scoreb,
      diferencia : parseInt(elEquipo.diferencia || 0) + (data.scorea - data.scoreb),
      puntos : parseInt(elEquipo.puntos || 0) + ptsA, 
      id_equipo:elEquipo.id_equipo,     
    }
    await updateReg('equipo',equipoAct);
    //para equipo B
    elEquipo = equipos.filter(f=>f.nombre === data.equipob)[0];
    equipoAct = {
      jugados : parseInt(elEquipo.jugados || 0)+1,
      ganados : parseInt(elEquipo.ganados || 0) + ptsA===0?1:0,
      empatados : parseInt(elEquipo.empatados || 0) + ptsA===1?1:0,
      perdidos : parseInt(elEquipo.pertidos || 0) + ptsA===3?1:0,
      favor : parseInt(elEquipo.favor || 0) + data.scoreb,
      contra : parseInt(elEquipo.contra || 0) + data.scorea,
      diferencia : parseInt(elEquipo.diferencia || 0) + (data.scoreb - data.scorea),
      puntos : parseInt(elEquipo.puntos || 0) + (ptsA===0?3:ptsA===3?0:1), 
      id_equipo:elEquipo.id_equipo,     
    }
    await updateReg('equipo',equipoAct);
  }

  const puntarBet= async (data) =>{
    console.log('puntuarBet',data,equipos);
    console.log(apuestasAll);
    const estasApuestas = apuestasAll.filter(f=>f.id_partido === data.id_partido);
    const factorA = (Number(equipos.filter(f=>f.nombre === data.equipoa)[0]?.nivel.replace('$','')) / 100)+1//id_partido;
    const factorB = (Number(equipos.filter(f=>f.nombre === data.equipob)[0]?.nivel.replace('$','')) / 100)+1;
    console.log('rev',estasApuestas,factorA,factorB,data);
    estasApuestas.map(e=>{
      let puntaje = 0
      if(data.scorea === e.scorea) puntaje+=1;
      if(data.scoreb === e.scoreb) puntaje+=1;
      if(data.scorea === e.scorea && data.scoreb === e.scoreb) puntaje+=1;
      if(data.scorea > data.scoreb && e.beta > e.betb) puntaje += (1*factorA)
      if(data.scorea < data.scoreb && e.beta < e.betb) puntaje += (1*factorB)
      if(data.scorea === e.beta && e.scoreb === e.betb) puntaje += 2
      //TODO: agregar la valoracion del factor de equipo y el tiempo antes del partido
      e.puntaje = puntaje;
      // console.log('laApuesta',e);
      return e;
    });

    estasApuestas.forEach(async (e) => {
      try {
        const formed = {
          id_apuesta:e.id_apuesta,
          puntaje:e.puntaje
        }
        await updateReg('apuesta',formed)
        // console.log('apuesta actualizada',e.id);
      } catch (error) {
        console.log(error);
      }
    });
  }

  const listarApuestas = async () =>{
    setOpenSpinner(true);
    apuestasAll = await getReg('vw_apuesta','id_apuesta',false);
    setOpenSpinner(false);
  }

  const colPartidos = [
    {field: 'Acciones', headerName: 'Acciones', sortable: false, flex:1,minWidth:60,
      renderCell: (params) => {
        return <IconButton onClick={()=>onChangeScore(params.row)} title='Actualizar Score' color={params.row.finalizado? 'success':'warning'}>
                {params.row.finalizado? <CheckCircleIcon fontSize="large"/>:<SaveAsIcon fontSize="large"/>} 
              </IconButton>;
      },
    },
    {field:'torneo',headerName:'COPA', minWidth:30,flex:1,type:'text',align:'center', /*renderCell:(params)=>{
      return <Typography variant="h6">{params.row.torneo}</Typography>
    }*/},
    {field:'fid_equipoa',headerName:'Equipo', minWidth:130, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipoa}`} width='50' src={`../assets/${params.row.codigoa}.png`} alt='X'/>
      <figcaption>{`${params.row.equipoa}`}</figcaption>
    </figure>},
    {field:'scorea',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.scorea}</Typography>
    }},
    {field:'scoreb',headerName:'Goles', minWidth:40,flex:1,editable:true,type:'number',min:0,max:9,align:'center', renderCell:(params)=>{
      return <Typography variant="h4" style={{display:'grid',placeItems:'center'}}>{params.row.scoreb}</Typography>
    }},
    {field:'fid_equipob',headerName:'Equipo', minWidth:130, flex:0.5, align:'center'
    , renderCell: (params) =><figure style={{alignItems:'center',margin:1,display:'flex',justifyContent:'flex-start'}}>
      <img title={`${params.row.equipob}`} width='50' src={`../assets/${params.row.codigob}.png`} alt='X'/>
      <figcaption>{`${params.row.equipob}`}</figcaption>
    </figure>},
    {field:'fechaPartidoStr',headerName:'Fecha Partido', minWidth:100,flex:1,editable:false},
    {field:'id_partido',headerName:'ID'},
  ]

  const cargarEquipos = async () =>{
    await getReg('equipo','nombre',true);
    // let resp = await getReg('equipo','nombre',true);
    // let respi = alasql('select * from ? order by nombre',[resp])
    // equiposAll = respi;
    // setEquipos(respi);
  }

  const listarPartidos = async()=>{
    let resp = await getReg('vw_partido','id_partido',false);
    resp.map(e=>{
      e.fechaPartidoStr = dayjs(e.fecha).format('DD/MMM HH:mm');
      return e
    })
    // let respi = resp.sort((a,b)=> new Date(a.fechaPartido).getTime() - new Date(b.fechaPartido).getTime());
    // resp = await alasql('select * from ? order by fecha',[resp])
    // console.log('partidos',resp);
    // setPartidos(resp);
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!partido.fid_equipoa || !partido.fid_equipob || new Date(partido.fecha) < new Date('2024-06-13')){
      setAlerta([true,'warning','Debe llenar todos los campos']);
      return
    }
    setOpenSpinner(true);
    const data = new FormData(e.currentTarget);
    // const nuevoPartido = {
    //   torneo:''
    //   fid_equipoa:
    //   fid_equipob
    //   fecha
    //   usuario_registro
    // }
    console.log('la data',data,partido);

    // const part = {nombre: data.get('equipoA'),factor: Number(data.get('scorea'))}
    // console.log(partido,part);
    try {
      await createReg(partido,'partido');
      setAlerta([true,'success','Partido registrado con éxito!']);
      listarPartidos();
      // console.log(nuevoPartido);
      // document.querySelector('#fid_equipoa').value = '';
      // document.querySelector('#fid_equipob').value = '';
      // document.querySelector('#fid_equipoa').focus();
      // setEquipos(equiposAll);
    } catch (error) {
      setAlerta([true,'error',error]);
      console.log(error.code,error.message);
    } finally{
      setOpenSpinner(false);
    }
    // console.log('registrado');
  }

  const handleChange = ({target:{value,name}})=>{
    console.log('cambiando',value,name);

    setPartido({...partido,[name]:value})
    // console.log(document.querySelector('#faseGrupos').value);
    const grupo = equipos.filter(f=>f.nombre === value)[0]?.grupo;
    const pivot = equipos.filter(f=>f.grupo === grupo);
    // setEquipos(pivot); 
  }

  const handleChangeFecha = (newValue) => {
    setPartido({...partido,fecha:dayjs(newValue).add(-4,'hours')});
  };

  const handleClose = ()=>{
    setAlerta([false,'success','vacio']);
  }

  const slideAlert = (props) => {
    return <Slide {...props} direction="up" />;
  }


  return (
    <>
    <Box component='main' sx={{backgroundColor:'whitesmoke',minHeight:'100vh',width:{xs:'100%',md:'80%'},display:'flex',flexDirection:{xs:'column',md:'row'},justifyContent:'center',marginX:'auto',gap:2}} >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{alignItems:'center',width:{xs:'100vw',md:400},mt:2,paddingX:2,justifyContent:'center'}}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4}}>Registro de Partidos</Typography>
        <FormGroup>
          <FormControlLabel sx={{pl:4}} control={<Checkbox id="faseGrupos" defaultChecked />} label="Fase de grupos" />
          <RadioGroup defaultValue='EURO COPA' name="torneo" id="torneo" onChange={handleChange}>
            <FormControlLabel value="EURO COPA" control={<Radio />} label="EURO COPA" />
            <FormControlLabel value="COPA AMERICA" control={<Radio />} label="COPA AMERICA" />
          </RadioGroup>
        </FormGroup>
        <InputLabel color="primary" >Equipo A</InputLabel>
        <Select
          labelId="fid_equipoa"
          id="fid_equipoa"
          name="fid_equipoa"
          input={<OutlinedInput />}
          fullWidth
          value={partido.fid_equipoa}
          label="Equipo A"
          displayEmpty
          size="small"
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.id_equipo} value={e.id_equipo}>{e.nombre}</MenuItem>
          })
        }
        </Select>
        <InputLabel color="primary" >Equipo B</InputLabel>
        <Select
          labelId="fid_equipob"
          id="fid_equipob"
          name="fid_equipob"
          fullWidth
          value={partido.fid_equipob}
          label="Equipo B"
          input={<OutlinedInput />}
          size="small"
          onChange={handleChange}
        >{
          equipos.map(e=>{
            return <MenuItem key={e.id_equipo} value={e.id_equipo}>{e.nombre}</MenuItem>
          })
        }
        </Select>
        <Box sx={{mt:2}}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es" localeText={esFechas.components.MuiLocalizationProvider.defaultProps.localeText}>
            <DateTimePicker
              label="Fecha y Hora Partido"
              fullWidth
              // value={partido.fecha}
              onChange={handleChangeFecha}
              ampm = {false}
              // timezone='Atlantic/Faroe'//"America/La_Paz"
              // maxDate={'20221218'}
              // maxTime={'15:00:00'}
              // minTime={'06:00:00'}
              inputFormat='DD/MM/YYYY HH:mm'
              disablePast
              // views={['year','month','day','hours','minutes']}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
              // renderInput={(params) => <TextField size="small" sx={{width:'50%'}} {...params} />}
            />
          </LocalizationProvider>
        </Box>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3}}>Registrar</Button>
      </Box>
      <Box sx={{ height:{xs:350,md:600}, width:{xs:'100vw',md:1000},justifyContent:'center',mt:2,paddingX:0.5}}>
        <Typography variant="h5" color='primary' sx={{fontWeight:500,backgroundColor:'secondary.main',borderRadius:2,pl:4,mb:1}}>Actualización de Resultados</Typography>
        <DataGrid
          getRowId={(row) => row.id_partido}
          rows={partidos}
          columns={colPartidos}
          pageSize={10}
          density="compact"
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5,10,25]}
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          columnVisibilityModel={{id_partido:false}}
          rowHeight={70}
          // sortModel={[{field:'fechaPartido'}]}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
    </Box>
    <Snackbar onClose={handleClose} open={alerta[0]} TransitionComponent={slideAlert} autoHideDuration={6000} anchorOrigin={{vertical:'top',horizontal:'right'}}>
      <Alert severity={alerta[1]} sx={{ width: '100%' }}> {alerta[2]}</Alert>
    </Snackbar>
    <Backdrop sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openSpinner}>
      <CircularProgress color="inherit" size='7rem' thickness={5} />
    </Backdrop>
    </>
  )
}
