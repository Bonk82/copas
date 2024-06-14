import {createContext, useContext} from 'react'

export const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}


// eslint-disable-next-line react/prop-types
export function AuthProvider({children}) {
  return (
      <AuthContext.Provider value={{
          usuario: 'bonk',
      }}>
          {children}
      </AuthContext.Provider>
  )
}