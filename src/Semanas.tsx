import { StyleSheet, Text, View } from 'react-native';

import { Colores } from './tema';

const MAX_SEMANAS = 8;

// Dibuja el coste como un calendario: cada cuadrado es un día de trabajo y cada fila una semana.
export function Semanas({ dias, diasSemana, c }: { dias: number; diasSemana: number; c: Colores }) {
  const columnas = Math.min(7, Math.max(1, Math.round(diasSemana)));
  const semanasTotales = Math.ceil(dias / columnas) || 1;
  const filas = Math.min(semanasTotales, MAX_SEMANAS);
  const sobran = semanasTotales - filas;

  return (
    <View>
      <View style={{ gap: 6 }}>
        {Array.from({ length: filas }, (_, f) => (
          <View key={f} style={estilos.fila}>
            {Array.from({ length: columnas }, (_, i) => {
              const relleno = Math.max(0, Math.min(1, dias - (f * columnas + i)));
              return (
                <View key={i} style={[estilos.dia, { backgroundColor: c.vacio }]}>
                  {relleno > 0 && (
                    <View style={[estilos.relleno, { width: `${relleno * 100}%`, backgroundColor: c.acento }]} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[estilos.leyenda, { color: c.suave }]}>
        {sobran > 0 ? `…y ${sobran} ${sobran === 1 ? 'semana' : 'semanas'} más. ` : ''}
        Cada fila es una semana de trabajo.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 6 },
  dia: { flex: 1, height: 26, borderRadius: 7, overflow: 'hidden', maxWidth: 64 },
  relleno: { height: '100%', borderRadius: 7 },
  leyenda: { fontSize: 13, marginTop: 10 },
});
