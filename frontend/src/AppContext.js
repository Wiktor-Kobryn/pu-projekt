import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTextId, setActiveTextId] = useState(null); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <AppContext.Provider value={{ activeTextId, setActiveTextId, refreshTrigger, triggerRefresh }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);