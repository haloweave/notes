'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoginDialogContextType {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(undefined);

export function LoginDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = () => setIsOpen(true);
    const closeDialog = () => setIsOpen(false);

    return (
        <LoginDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
            {children}
        </LoginDialogContext.Provider>
    );
}

export function useLoginDialog() {
    const context = useContext(LoginDialogContext);
    if (context === undefined) {
        throw new Error('useLoginDialog must be used within a LoginDialogProvider');
    }
    return context;
}
