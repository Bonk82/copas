import { Box } from "@mui/material"
import { Navbar } from "../components/Navbar"
import { useSupa } from "../context/SupabaseContext";

// eslint-disable-next-line react/prop-types
export const AppLayout = ({children}) => {
  const {usuario} = useSupa();

  return (
    <Box sx={{ display: 'flex'}}>
        <Navbar/>
        <Box component='main' sx={{width:{xs:'100%',md:'80%'},justifyContent:'center'}}>
            { children }
        </Box>
    </Box>
  )
}
