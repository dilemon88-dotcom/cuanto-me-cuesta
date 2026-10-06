import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Solo en la versión web: decide si mostrar la ayuda para instalar la app en el móvil.
// - Android/Chrome: el navegador avisa con `beforeinstallprompt` y podemos abrir su diálogo.
// - iPhone/Safari: no hay diálogo; hay que explicar "Compartir → Añadir a pantalla de inicio".

type EventoInstalar = Event & { prompt: () => Promise<void> };

export type Instalacion = { tipo: 'ninguna' } | { tipo: 'ios' } | { tipo: 'android'; instalar: () => Promise<void> };

function yaInstalada() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function esIOS() {
  const ua = navigator.userAgent;
  // Los iPad modernos dicen ser un Mac, pero tienen pantalla táctil
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function useInstalacion(): Instalacion {
  const [estado, setEstado] = useState<Instalacion>({ tipo: 'ninguna' });

  useEffect(() => {
    if (Platform.OS !== 'web' || yaInstalada()) return;
    if (esIOS()) {
      setEstado({ tipo: 'ios' });
      return;
    }
    const alAvisar = (e: Event) => {
      e.preventDefault();
      const evento = e as EventoInstalar;
      setEstado({
        tipo: 'android',
        instalar: async () => {
          await evento.prompt();
          setEstado({ tipo: 'ninguna' });
        },
      });
    };
    const alInstalar = () => setEstado({ tipo: 'ninguna' });
    window.addEventListener('beforeinstallprompt', alAvisar);
    window.addEventListener('appinstalled', alInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', alAvisar);
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, []);

  return estado;
}

export function registrarServiceWorker() {
  if (Platform.OS !== 'web' || !('serviceWorker' in navigator) || location.hostname === 'localhost') return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
