import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

// eslint-disable-next-line react/prop-types
export const ProtectedRoute = ({children}) => {
  const { usuario } = UserAuth();


  // if (loading) return <h1>Loading</h1>;
  console.log('protected routes',usuario);
  if (!usuario) return <Navigate to="/login" />;

  return <>{children}</>
}
