// src/hooks/useSocket.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socketService } from '../utils/socket';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

export const useSocket = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from localStorage or store
      const token = localStorage.getItem('accessToken');
      socketService.connect(token);

      return () => {
        socketService.disconnect();
        socketService.removeAllListeners();
      };
    }
  }, [isAuthenticated, user]);
};