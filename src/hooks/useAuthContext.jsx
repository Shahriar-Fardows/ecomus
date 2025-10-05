// src/Auth/hooks/useAuthContext.js
import { useContext } from "react";
import { Contexts } from "../auth/context/Context";

const useAuthContext = () => {
    const context = useContext(Contexts);
    
    if (!context) {
        throw new Error('useAuthContext must be used within a Context Provider');
    }
    
    return context;
};

export default useAuthContext;