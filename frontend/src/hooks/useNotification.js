// src/hooks/useNotification.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { socketService } from '../utils/socket';
import { api } from '../services/api';

export const useNotification = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewNotification = (notification) => {
      toast(notification.title, {
        description: notification.message,
        icon: '🔔',
      });
      dispatch(api.util.invalidateTags(['Notifications']));
    };

    const handleRequestStatusUpdate = (data) => {
      const message = data.status === 'accepted' 
        ? 'Your request has been accepted!' 
        : 'Your request status has been updated';
      toast.success(message);
      dispatch(api.util.invalidateTags(['Requests']));
    };

    const handleDonorNeeded = (notification) => {
      toast.custom((t) => (
        <div className="bg-red-100 p-4 rounded-lg shadow-lg">
          <h3 className="font-bold text-red-800">🚨 Urgent Blood Needed</h3>
          <p className="text-red-700">{notification.message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            I Can Help
          </button>
        </div>
      ));
    };

    const handleInventoryChanged = (data) => {
      dispatch(api.util.invalidateTags(['Inventory']));
    };

    socketService.on('notification', handleNewNotification);
    socketService.on('request_status_update', handleRequestStatusUpdate);
    socketService.on('donor_needed', handleDonorNeeded);
    socketService.on('inventory_changed', handleInventoryChanged);

    return () => {
      socketService.off('notification');
      socketService.off('request_status_update');
      socketService.off('donor_needed');
      socketService.off('inventory_changed');
    };
  }, [dispatch]);
};