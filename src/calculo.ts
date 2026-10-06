export type Ajustes = {
  sueldoMensual: number; // neto, lo que cobras cada paga
  pagas: number; // 12 o 14
  horasSemana: number;
  diasSemana: number;
};

export type Coste = {
  horasTotales: number;
  dias: number; // días de trabajo completos
  horasRestantes: number;
  semanas: number;
  meses: number;
};

const SEMANAS_AL_ANO = 52;

export function ganancias(a: Ajustes) {
  const anual = a.sueldoMensual * a.pagas;
  const porHora = anual / (a.horasSemana * SEMANAS_AL_ANO);
  const horasDia = a.horasSemana / a.diasSemana;
  return { anual, porHora, porDia: porHora * horasDia, horasDia };
}

export function ajustesValidos(a: Ajustes) {
  return a.sueldoMensual > 0 && a.pagas > 0 && a.horasSemana > 0 && a.diasSemana > 0 && a.diasSemana <= 7;
}

export function costeEnTiempo(precio: number, a: Ajustes): Coste {
  const { porHora, horasDia } = ganancias(a);
  const horasTotales = precio / porHora;
  const dias = Math.floor(horasTotales / horasDia);
  const horasRestantes = horasTotales - dias * horasDia;
  const semanas = horasTotales / a.horasSemana;
  return { horasTotales, dias, horasRestantes, semanas, meses: semanas / (SEMANAS_AL_ANO / 12) };
}

// Acepta "1.500,50", "1500.5", "1500"
export function leerNumero(texto: string): number {
  let t = texto.trim().replace(/\s|€/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

// Formato español con punto de miles siempre (toLocaleString no lo pone en 4 cifras)
const fmt = (n: number, dec = 0) => {
  const [entera, decimales] = n.toFixed(dec).split('.');
  const conMiles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimales ? `${conMiles},${decimales}` : conMiles;
};

export const euros = (n: number) => `${fmt(n, n % 1 === 0 ? 0 : 2)} €`;

export function textoHoras(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  const enteras = Math.floor(h);
  const min = Math.round((h - enteras) * 60);
  if (min === 60) return `${enteras + 1} h`;
  return min ? `${enteras} h ${min} min` : `${enteras} h`;
}

export function textoCoste(c: Coste) {
  if (c.dias === 0) return textoHoras(c.horasTotales);
  const d = `${c.dias} ${c.dias === 1 ? 'día' : 'días'}`;
  return c.horasRestantes >= 1 / 60 ? `${d} y ${textoHoras(c.horasRestantes)}` : d;
}

export function textoExtra(c: Coste) {
  if (c.meses >= 1) return `≈ ${fmt(c.meses, 1)} meses`;
  if (c.semanas >= 1) return `≈ ${fmt(c.semanas, 1)} semanas`;
  return `${fmt(c.horasTotales, 1)} horas`;
}
