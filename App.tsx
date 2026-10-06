import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  Ajustes,
  ajustesValidos,
  costeEnTiempo,
  euros,
  ganancias,
  leerNumero,
  textoCoste,
  textoExtra,
} from './src/calculo';
import { registrarServiceWorker, useInstalacion } from './src/instalar';

type Deseo = { id: string; nombre: string; precio: number };

const CLAVE_AJUSTES = 'ajustes';
const CLAVE_DESEOS = 'deseos';

const URL_APP = 'https://dilemon88-dotcom.github.io/cuanto-me-cuesta/';

const claro = {
  fondo: '#F6F4EF',
  tarjeta: '#FFFFFF',
  texto: '#1C1B19',
  suave: '#6B675F',
  borde: '#E2DED5',
  campo: '#FBFAF7',
  placeholder: '#B5B0A6',
  acento: '#E4572E',
  acentoTexto: '#E4572E',
  acentoSuave: '#FCE9E3',
  invertido: '#FFFFFF',
};
const oscuro: typeof claro = {
  fondo: '#141312',
  tarjeta: '#1F1D1B',
  texto: '#F3F1EC',
  suave: '#A39E94',
  borde: '#34312D',
  campo: '#181715',
  placeholder: '#6B675F',
  acento: '#E4572E',
  acentoTexto: '#FF7A52',
  acentoSuave: '#3A2018',
  invertido: '#141312',
};
type Colores = typeof claro;

registrarServiceWorker();

export default function App() {
  return (
    <SafeAreaProvider>
      <Pantalla />
    </SafeAreaProvider>
  );
}

function Pantalla() {
  const tema = useColorScheme() === 'dark' ? 'dark' : 'light';
  const color = tema === 'dark' ? oscuro : claro;
  const styles = tema === 'dark' ? estilosOscuro : estilosClaro;
  const [cargado, setCargado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [sueldo, setSueldo] = useState('');
  const [pagas, setPagas] = useState(12);
  const [horas, setHoras] = useState('40');
  const [dias, setDias] = useState('5');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [deseos, setDeseos] = useState<Deseo[]>([]);
  const [verAyuda, setVerAyuda] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const instalacion = useInstalacion();

  useEffect(() => {
    (async () => {
      try {
        const [a, d] = await Promise.all([AsyncStorage.getItem(CLAVE_AJUSTES), AsyncStorage.getItem(CLAVE_DESEOS)]);
        if (a) {
          const g: Ajustes = JSON.parse(a);
          setSueldo(String(g.sueldoMensual));
          setPagas(g.pagas);
          setHoras(String(g.horasSemana));
          setDias(String(g.diasSemana));
        } else {
          setEditando(true);
        }
        if (d) setDeseos(JSON.parse(d));
      } catch {
        setEditando(true);
      }
      setCargado(true);
    })();
  }, []);

  const ajustes: Ajustes = {
    sueldoMensual: leerNumero(sueldo),
    pagas,
    horasSemana: leerNumero(horas),
    diasSemana: leerNumero(dias),
  };
  const validos = ajustesValidos(ajustes);

  useEffect(() => {
    if (cargado && validos) AsyncStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes)).catch(() => {});
  }, [cargado, sueldo, pagas, horas, dias]);

  useEffect(() => {
    if (cargado) AsyncStorage.setItem(CLAVE_DESEOS, JSON.stringify(deseos)).catch(() => {});
  }, [cargado, deseos]);

  const valorPrecio = leerNumero(precio);
  const coste = validos && valorPrecio > 0 ? costeEnTiempo(valorPrecio, ajustes) : null;
  const total = deseos.reduce((s, d) => s + d.precio, 0);
  const g = validos ? ganancias(ajustes) : null;

  const guardarDeseo = () => {
    if (!coste) return;
    setDeseos([{ id: String(Date.now()), nombre: nombre.trim() || 'Sin nombre', precio: valorPrecio }, ...deseos]);
    setNombre('');
    setPrecio('');
  };

  const compartir = async () => {
    const texto = 'Mira cuántos días de trabajo te cuesta lo que quieres comprar';
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message: `${texto}: ${URL_APP}` });
      } else if (navigator.share) {
        await navigator.share({ title: '¿Cuánto me cuesta?', text: texto, url: URL_APP });
      } else {
        await navigator.clipboard.writeText(URL_APP);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } catch {
      // El usuario cerró el menú de compartir
    }
  };

  if (!cargado) return null;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style={tema === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>¿Cuánto me cuesta?</Text>
          <Text style={styles.subtitulo}>El precio de las cosas, en tiempo de trabajo.</Text>

          {verAyuda && instalacion.tipo !== 'ninguna' && (
            <View style={styles.ayuda}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ayudaTitulo}>Instálala en tu móvil</Text>
                <Text style={styles.ayudaTexto}>
                  {instalacion.tipo === 'ios'
                    ? 'En Safari, pulsa Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».'
                    : 'Tendrás su icono en la pantalla de inicio y funcionará sin internet.'}
                </Text>
                {instalacion.tipo === 'android' && (
                  <Pressable onPress={instalacion.instalar} style={styles.ayudaBoton}>
                    <Text style={styles.botonTexto}>Instalar</Text>
                  </Pressable>
                )}
              </View>
              <Pressable accessibilityLabel="Cerrar" hitSlop={10} onPress={() => setVerAyuda(false)}>
                <Text style={styles.quitar}>✕</Text>
              </Pressable>
            </View>
          )}

          {editando || !g ? (
            <View style={styles.tarjeta}>
              <Text style={styles.seccion}>Tu trabajo</Text>
              <Campo
                c={color}
                etiqueta="Sueldo neto al mes (€)"
                valor={sueldo}
                onChange={setSueldo}
                placeholder="1.800"
              />
              <Text style={styles.etiqueta}>Pagas al año</Text>
              <View style={styles.fila}>
                {[12, 14].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPagas(p)}
                    style={[styles.opcion, pagas === p && styles.opcionActiva]}
                  >
                    <Text style={[styles.opcionTexto, pagas === p && styles.opcionTextoActivo]}>{p} pagas</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.fila}>
                <View style={{ flex: 1 }}>
                  <Campo c={color} etiqueta="Horas a la semana" valor={horas} onChange={setHoras} placeholder="40" />
                </View>
                <View style={{ flex: 1 }}>
                  <Campo c={color} etiqueta="Días a la semana" valor={dias} onChange={setDias} placeholder="5" />
                </View>
              </View>
              {g ? (
                <Boton c={color} texto="Listo" onPress={() => setEditando(false)} />
              ) : (
                <Text style={styles.aviso}>Rellena tu sueldo y tu horario para empezar.</Text>
              )}
            </View>
          ) : (
            <Pressable style={styles.resumen} onPress={() => setEditando(true)}>
              <Text style={styles.resumenTexto}>
                Ganas <Text style={styles.negrita}>{euros(round2(g.porHora))}/hora</Text> ·{' '}
                <Text style={styles.negrita}>{euros(round2(g.porDia))}/día</Text>
              </Text>
              <Text style={styles.enlace}>Cambiar</Text>
            </Pressable>
          )}

          {g && (
            <View style={styles.tarjeta}>
              <Text style={styles.seccion}>¿Qué quieres comprar?</Text>
              <Campo
                c={color}
                etiqueta="Qué es (opcional)"
                valor={nombre}
                onChange={setNombre}
                placeholder="Móvil nuevo"
                texto
              />
              <Campo c={color} etiqueta="Precio (€)" valor={precio} onChange={setPrecio} placeholder="1.500" />

              {coste && (
                <View style={styles.resultado}>
                  <Text style={styles.resultadoPequeno}>Te cuesta</Text>
                  <Text style={styles.resultadoGrande}>{textoCoste(coste)}</Text>
                  <Text style={styles.resultadoPequeno}>de trabajo · {textoExtra(coste)}</Text>
                </View>
              )}
              {coste && <Boton c={color} texto="Añadir a mi lista" onPress={guardarDeseo} />}
            </View>
          )}

          {g && deseos.length > 0 && (
            <View style={styles.tarjeta}>
              <Text style={styles.seccion}>Mi lista</Text>
              {deseos.map((d) => (
                <View key={d.id} style={styles.deseo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deseoNombre}>{d.nombre}</Text>
                    <Text style={styles.deseoPrecio}>{euros(d.precio)}</Text>
                  </View>
                  <Text style={styles.deseoCoste}>{textoCoste(costeEnTiempo(d.precio, ajustes))}</Text>
                  <Pressable
                    accessibilityLabel={`Quitar ${d.nombre}`}
                    hitSlop={10}
                    onPress={() => setDeseos(deseos.filter((x) => x.id !== d.id))}
                  >
                    <Text style={styles.quitar}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <View style={[styles.deseo, { borderBottomWidth: 0 }]}>
                <Text style={[styles.deseoNombre, { flex: 1 }]}>Total · {euros(total)}</Text>
                <Text style={[styles.deseoCoste, styles.negrita]}>{textoCoste(costeEnTiempo(total, ajustes))}</Text>
              </View>
            </View>
          )}

          <Pressable onPress={compartir} style={styles.compartir}>
            <Text style={styles.enlace}>{copiado ? 'Enlace copiado ✓' : 'Compartir la app'}</Text>
          </Pressable>
          <Text style={styles.pie}>Tus datos se guardan solo en este móvil.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function Campo(props: {
  c: Colores;
  etiqueta: string;
  valor: string;
  onChange: (t: string) => void;
  placeholder?: string;
  texto?: boolean;
}) {
  const styles = props.c === oscuro ? estilosOscuro : estilosClaro;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.etiqueta}>{props.etiqueta}</Text>
      <TextInput
        style={styles.input}
        value={props.valor}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        placeholderTextColor={props.c.placeholder}
        keyboardType={props.texto ? 'default' : 'decimal-pad'}
        returnKeyType="done"
      />
    </View>
  );
}

function Boton({ c, texto, onPress }: { c: Colores; texto: string; onPress: () => void }) {
  const styles = c === oscuro ? estilosOscuro : estilosClaro;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.boton, pressed && { opacity: 0.8 }]}>
      <Text style={styles.botonTexto}>{texto}</Text>
    </Pressable>
  );
}

const estilos = (color: Colores) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: color.fondo },
    contenido: { padding: 20, paddingBottom: 48, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
    titulo: { fontSize: 32, fontWeight: '800', color: color.texto, marginTop: 8 },
    subtitulo: { fontSize: 15, color: color.suave, marginTop: -8 },
    tarjeta: {
      backgroundColor: color.tarjeta,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: color.borde,
    },
    seccion: { fontSize: 18, fontWeight: '700', color: color.texto, marginBottom: 14 },
    etiqueta: { fontSize: 13, color: color.suave, marginBottom: 6, fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: color.borde,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 17,
      color: color.texto,
      backgroundColor: color.campo,
    },
    fila: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    opcion: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: color.borde,
      alignItems: 'center',
    },
    opcionActiva: { backgroundColor: color.texto, borderColor: color.texto },
    opcionTexto: { fontSize: 15, color: color.texto, fontWeight: '600' },
    opcionTextoActivo: { color: color.invertido },
    aviso: { fontSize: 14, color: color.suave },
    boton: { backgroundColor: color.acento, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
    resumen: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: color.tarjeta,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: color.borde,
    },
    resumenTexto: { fontSize: 15, color: color.texto, flexShrink: 1 },
    negrita: { fontWeight: '700' },
    enlace: { color: color.acentoTexto, fontWeight: '700', marginLeft: 12 },
    resultado: {
      backgroundColor: color.acentoSuave,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    resultadoPequeno: { fontSize: 14, color: color.suave, textAlign: 'center' },
    resultadoGrande: {
      fontSize: 30,
      fontWeight: '800',
      color: color.acentoTexto,
      marginVertical: 4,
      textAlign: 'center',
    },
    deseo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: color.borde,
    },
    deseoNombre: { fontSize: 16, color: color.texto, fontWeight: '600' },
    deseoPrecio: { fontSize: 13, color: color.suave, marginTop: 2 },
    deseoCoste: { fontSize: 15, color: color.acentoTexto, fontWeight: '600' },
    ayuda: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: color.acentoSuave,
      borderRadius: 14,
      padding: 14,
    },
    ayudaTitulo: { fontSize: 15, fontWeight: '700', color: color.texto, marginBottom: 4 },
    ayudaTexto: { fontSize: 14, color: color.texto, lineHeight: 20 },
    ayudaBoton: {
      backgroundColor: color.acento,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 18,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    compartir: { alignSelf: 'center', paddingVertical: 8, marginTop: 4 },
    pie: { fontSize: 13, color: color.suave, textAlign: 'center', marginTop: -8 },
    quitar: { fontSize: 16, color: color.suave, paddingHorizontal: 4 },
  });
const estilosClaro = estilos(claro);
const estilosOscuro = estilos(oscuro);
