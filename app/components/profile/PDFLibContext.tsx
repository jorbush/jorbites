import React, { createContext, useContext } from 'react';
import type * as ReactPDF from '@react-pdf/renderer';

const PDFLibContext = createContext<typeof ReactPDF | null>(null);

export const PDFLibProvider: React.FC<{
    lib: typeof ReactPDF;
    children: React.ReactNode;
}> = ({ lib, children }) => {
    return (
        <PDFLibContext.Provider value={lib}>{children}</PDFLibContext.Provider>
    );
};

export const usePDFLib = () => {
    const context = useContext(PDFLibContext);
    if (!context) {
        throw new Error('usePDFLib must be used within a PDFLibProvider');
    }
    return context;
};
