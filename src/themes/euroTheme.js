import { createTheme } from '@mui/material';
import { purple, red, teal } from '@mui/material/colors';
import { esES as dataGridDeDE } from '@mui/x-data-grid/locales';
import { esES as coreDeDE } from '@mui/material/locale';
import { esES } from '@mui/x-date-pickers/locales';

export const euroTheme = createTheme({
    //Ocean boat blue	#1077C3; Picton blue	#49BCE3
    palette: {
        primary: {
            main: '#0864a1'
        },
        secondary: {
            main: '#2da1d6'
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
            main: '#0864a1'
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





