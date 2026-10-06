// Ejemplos para probar la app con un toque
export const EJEMPLOS = [
  { emoji: '☕', nombre: 'Café', precio: 2 },
  { emoji: '🍕', nombre: 'Cena fuera', precio: 40 },
  { emoji: '👟', nombre: 'Zapatillas', precio: 120 },
  { emoji: '🎮', nombre: 'Consola', precio: 550 },
  { emoji: '✈️', nombre: 'Viaje', precio: 800 },
  { emoji: '📱', nombre: 'Móvil nuevo', precio: 1200 },
  { emoji: '🚗', nombre: 'Coche', precio: 18000 },
];

const PALABRAS: [RegExp, string][] = [
  [/viaje|vuelo|avi[oó]n|vacaciones|hotel|playa/, '✈️'],
  [/m[oó]vil|iphone|tel[eé]fono|samsung/, '📱'],
  [/port[aá]til|ordenador|pc|mac|tablet|ipad/, '💻'],
  [/tele|tv|televisi[oó]n/, '📺'],
  [/consola|play|xbox|switch|juego/, '🎮'],
  [/coche|moto|carro/, '🚗'],
  [/bici/, '🚲'],
  [/zapatilla|zapato|bota/, '👟'],
  [/ropa|camiseta|chaqueta|abrigo|pantal[oó]n|vestido/, '👕'],
  [/caf[eé]/, '☕'],
  [/cena|comida|restaurante|pizza|hamburguesa/, '🍕'],
  [/cerveza|copa|fiesta|concierto|entrada/, '🎉'],
  [/reloj/, '⌚'],
  [/casco|auricular|cascos|altavoz|m[uú]sica/, '🎧'],
  [/libro/, '📚'],
  [/regalo/, '🎁'],
  [/casa|piso|alquiler|mueble|sof[aá]/, '🏠'],
  [/gimnasio|gym|deporte/, '🏋️'],
  [/perro|gato|mascota/, '🐶'],
];

export function adivinarEmoji(nombre: string) {
  const n = nombre.toLowerCase();
  return PALABRAS.find(([re]) => re.test(n))?.[1] ?? '🛍️';
}
