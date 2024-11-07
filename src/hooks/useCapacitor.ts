import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { PushNotifications } from '@capacitor/push-notifications';
import { Share } from '@capacitor/share';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import toast from 'react-hot-toast';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(Capacitor.isNativePlatform());
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (isNative) {
      // Configuration initiale
      const setupNative = async () => {
        try {
          // Status Bar
          await StatusBar.setStyle({ style: 'dark' });
          await StatusBar.setBackgroundColor({ color: '#7C3AED' });

          // Notifications Push
          const permission = await PushNotifications.requestPermissions();
          if (permission.receive === 'granted') {
            await PushNotifications.register();
          }

          // Gestion du clavier
          Keyboard.addListener('keyboardWillShow', (info) => {
            setKeyboardHeight(info.keyboardHeight);
          });

          Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardHeight(0);
          });

          // Gestion du retour arrière
          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });

          // Masquer le splash screen
          await SplashScreen.hide();
        } catch (error) {
          console.error('Error setting up native features:', error);
        }
      };

      setupNative();
    }

    return () => {
      if (isNative) {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, [isNative]);

  const shareContent = async (title: string, text: string, url?: string) => {
    try {
      if (isNative) {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: 'Partager'
        });
      } else {
        if (navigator.share) {
          await navigator.share({ title, text, url });
        } else {
          await navigator.clipboard.writeText(url || text);
          toast.success('Lien copié !');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Erreur lors du partage');
    }
  };

  const takePicture = async () => {
    try {
      if (isNative) {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: 'uri'
        });
        return image.webPath;
      } else {
        // Fallback pour le web
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();
        return new Promise((resolve) => {
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            }
          };
        });
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast.error('Erreur lors de la prise de photo');
      return null;
    }
  };

  const getCurrentPosition = async () => {
    try {
      if (isNative) {
        return await Geolocation.getCurrentPosition();
      } else {
        return await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Erreur lors de la géolocalisation');
      return null;
    }
  };

  const vibrate = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isNative) {
      const styles = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      };
      await Haptics.impact({ style: styles[style] });
    }
  };

  return {
    isNative,
    keyboardHeight,
    shareContent,
    takePicture,
    getCurrentPosition,
    vibrate
  };
}