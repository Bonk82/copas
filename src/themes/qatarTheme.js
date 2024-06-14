import { createTheme } from '@mui/material';
import { purple, red, teal } from '@mui/material/colors';
import { esES as dataGridDeDE } from '@mui/x-data-grid/locales';
import { esES as coreDeDE } from '@mui/material/locale';
import { esES } from '@mui/x-date-pickers/locales';

export const qatarTheme = createTheme({
    //Ocean boat blue	#1077C3; Picton blue	#49BCE3
    palette: {
        primary: {
            main: '#56042c'
        },
        secondary: {
            main: '#fec310'
        },
        success: {
            main: teal[600]
        },
        error: {
            main: red.A400
        },
        info:{
            main:purple[300]
        },
        persist: {
            main: '#56042c'
        },
    },
    typography:{
        fontFamily:['monospace','arial'],
    } 
},
esES,
dataGridDeDE,
coreDeDE
)





