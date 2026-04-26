import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import "./styles/main.css";
import "./services/axiosConfig";

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
    <App />
  </AuthProvider>
  </StrictMode>,
)



