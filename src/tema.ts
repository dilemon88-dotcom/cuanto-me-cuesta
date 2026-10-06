export const claro = {
  fondo: '#FFF8F3',
  tarjeta: '#FFFFFF',
  texto: '#1A1423',
  suave: '#7A6F7D',
  borde: '#F1E5DE',
  campo: '#FFF4EE',
  placeholder: '#C2B4B0',
  acento: '#FF5A36',
  acentoTexto: '#E5482A',
  acentoSuave: '#FFE9E1',
  vacio: '#F5EAE4',
  sombra: '#C2410C',
};

export const oscuro: typeof claro = {
  fondo: '#120E16',
  tarjeta: '#1E1823',
  texto: '#F7F1F5',
  suave: '#A79BA8',
  borde: '#2E2533',
  campo: '#17121B',
  placeholder: '#5E5361',
  acento: '#FF5A36',
  acentoTexto: '#FF7A57',
  acentoSuave: '#3A1E22',
  vacio: '#2C2331',
  sombra: '#000000',
};

export type Colores = typeof claro;

// Degradado de la marca: naranja → coral → magenta
export const degradado = ['#FF7A3D', '#FF4D5E', '#E8338B'] as const;

export const fuente = {
  titulo: 'Bricolage-ExtraBold',
  medio: 'Bricolage-SemiBold',
};
