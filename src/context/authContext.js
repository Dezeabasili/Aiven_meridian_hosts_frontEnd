import { useState, createContext, useContext } from "react";

const AuthContext = createContext()

// export const baseURL = "http://localhost:4000/"
// export const baseURL = "https://mysql-meridian-hosts-backend.onrender.com/"
export const baseURL = "https://aiven-meridian-hosts-server.onrender.com/"

export const useAuthContext = () => {
    return useContext(AuthContext)
}

export const AuthContextProvider = ({ children }) => {
    const [profilePhoto, setProfilePhoto] = useState(JSON.parse(localStorage.getItem('profilePhoto')) || '')
    const [auth, setAuth] = useState({})
    const [trustThisDevice, setTrustThisDevice] = useState(JSON.parse(localStorage.getItem('trustThisDevice')) || false)
    // console.log(auth)

    return <AuthContext.Provider value={{ auth, setAuth, trustThisDevice, setTrustThisDevice, profilePhoto, setProfilePhoto }}>
    {children}
</AuthContext.Provider>
}

