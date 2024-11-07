import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PermissionState {
  camera: PermissionState['state'];
  photos: PermissionState['state'];
  location: PermissionState['state'];
  state: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'prompt',
    photos: 'prompt',
    location: 'prompt',
    state: 'prompt'
  });

  const checkPermission = async (name: keyof typeof permissions) => {
    try {
      if (name === 'camera') {
        const result = await navigator.permissions.query({ name: 'camera' });
        return result.state;
      } else if (name === 'location') {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
      } else if (name === 'photos') {
        // Photos permission is always considered granted since we'll use input[type="file"]
        return 'granted';
      }
    } catch {
      return 'unavailable';
    }
  };

  const requestPermission = async (name: keyof typeof permissions) => {
    try {
      if (name === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({ ...prev, camera: 'granted' }));
        return 'granted';
      } else if (name === 'location') {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setPermissions(prev => ({ ...prev, location: 'granted' }));
        return 'granted';
      } else if (name === 'photos') {
        // Always consider photos permission granted since we'll use standard file input
        setPermissions(prev => ({ ...prev, photos: 'granted' }));
        return 'granted';
      }
    } catch (error) {
      console.error(`Error requesting ${name} permission:`, error);
      toast.error(`Impossible d'accéder à ${name === 'camera' ? 'la caméra' : name === 'location' ? 'la localisation' : 'vos photos'}`);
      setPermissions(prev => ({ ...prev, [name]: 'denied' }));
      return 'denied';
    }
  };

  useEffect(() => {
    const checkAllPermissions = async () => {
      const camera = await checkPermission('camera');
      const location = await checkPermission('location');
      const photos = await checkPermission('photos');

      setPermissions({
        camera,
        location,
        photos,
        state: camera === 'granted' && location === 'granted' ? 'granted' : 'prompt'
      });
    };

    checkAllPermissions();
  }, []);

  return {
    permissions,
    requestPermission,
    requestAllPermissions: async () => {
      const results = await Promise.all([
        requestPermission('camera'),
        requestPermission('location'),
        requestPermission('photos')
      ]);
      
      const allGranted = results.every(result => result === 'granted');
      setPermissions(prev => ({
        ...prev,
        state: allGranted ? 'granted' : 'denied'
      }));
      
      return allGranted;
    }
  };
}