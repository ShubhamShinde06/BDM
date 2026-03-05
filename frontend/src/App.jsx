// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import AppRoutes from './AppRoutes';
import { useSocket } from './hooks/useSocket';
import { useNotification } from './hooks/useNotification';
import './styles/index.css';

const AppContent = () => {
  useSocket();
  useNotification();
  return <AppRoutes />;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;