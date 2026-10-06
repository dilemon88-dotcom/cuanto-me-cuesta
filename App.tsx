import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Ajustes,
  ajustesValidos,
  Coste,
  costeEnTiempo,
  euros,
  ganancias,
  leerNumero,
  textoCoste,
  textoExtra,
  textoHoras,
} from './src/calculo';
import { adivinarEmoji, EJEMPLOS } from './src/emoji';
import { registrarServiceWorker, useInstalacion } from './src/instalar';
import { Semanas } from './src/Semanas';
import { claro, Colores, degradado, fuente, oscuro } from './src/tema';

type Deseo = { id: string; nombre: string; precio: number; emoji?: string };

const CLAVE_AJUSTES = 'ajustes';
const CLAVE_DESEOS = 'deseos';
const URL_APP = 'https://dilemon88-dotcom.github.io/cuanto-me-cuesta/';

registrarServiceWorker();

export default function App() {
  const [fuentesListas, errorFuentes] = useFonts({
    [fuente.titulo]: BricolageGrotesque_800ExtraBold,
    [fuente.medio]: BricolageGrotesque_600SemiBold,
  });
  if (!fuentesListas && !errorFuentes) return null;
  return (
    <SafeAreaProvider>
      <Pantalla />
    </SafeAreaProvider>
  );
}

function Pantalla() {
  const oscuroActivo = useColorScheme() === 'dark';
  const c = oscuroActivo ? oscuro : claro;
  const s = oscuroActivo ? estilosOscuro : estilosClaro;
  const insets = useSafeAreaInsets();

  const [cargado, setCargado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [sueldo, setSueldo] = useState('');
  const [pagas, setPagas] = useState(12);
  const [horas, setHoras] = useState('40');
  const [dias, setDias] = useState('5');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [emoji, setEmoji] = useState<string | null>(null);
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
  const g = validos ? ganancias(ajustes) : null;
  const mostrarAjustes = editando || !g;

  const elegirEjemplo = (e: (typeof EJEMPLOS)[number]) => {
    setNombre(e.nombre);
    setPrecio(String(e.precio));
    setEmoji(e.emoji);
  };

  const cambiarNombre = (t: string) => {
    setNombre(t);
    setEmoji(null);
  };

  const guardarDeseo = () => {
    if (!coste) return;
    const n = nombre.trim() || 'Sin nombre';
    setDeseos([
      { id: String(Date.now()), nombre: n, precio: valorPrecio, emoji: emoji ?? adivinarEmoji(n) },
      ...deseos,
    ]);
    setNombre('');
    setPrecio('');
    setEmoji(null);
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
    <View style={s.pantalla}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera */}
          <LinearGradient
            colors={degradado}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.cabecera, { paddingTop: insets.top + 18 }]}
          >
            <View style={s.centrado}>
              <View style={s.marca}>
                <View style={s.logo}>
                  <Text style={s.logoTexto}>€</Text>
                </View>
                <Text style={s.marcaTexto}>¿Cuánto me cuesta?</Text>
                {g && !mostrarAjustes && (
                  <Pressable onPress={() => setEditando(true)} style={s.pastilla} hitSlop={8}>
                    <Text style={s.pastillaTexto}>Editar sueldo</Text>
                  </Pressable>
                )}
              </View>

              {g && !mostrarAjustes ? (
                <>
                  <Text style={s.heroEtiqueta}>Tu hora de trabajo vale</Text>
                  <Text style={s.heroNumero}>{euros(redondear(g.porHora))}</Text>
                  <View style={s.chips}>
                    <Chip>{euros(redondear(g.porDia))} al día</Chip>
                    <Chip>{textoHoras(g.horasDia)} por día</Chip>
                    <Chip>{euros(redondear(g.anual))} al año</Chip>
                  </View>
                </>
              ) : (
                <>
                  <Text style={s.heroTitulo}>¿Cuánto de tu vida cuesta lo que quieres?</Text>
                  <Text style={s.heroTexto}>
                    Dinos lo que ganas y te diremos cuántos días tienes que trabajar para pagar cada cosa.
                  </Text>
                </>
              )}
            </View>
          </LinearGradient>

          <View style={[s.contenido, s.centrado]}>
            {verAyuda && instalacion.tipo !== 'ninguna' && (
              <View style={[s.tarjeta, s.ayuda]}>
                <Text style={{ fontSize: 28 }}>📲</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.ayudaTitulo}>Instálala en tu móvil</Text>
                  <Text style={s.ayudaTexto}>
                    {instalacion.tipo === 'ios'
                      ? 'En Safari, pulsa Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio».'
                      : 'Tendrás su icono en la pantalla de inicio y funcionará sin internet.'}
                  </Text>
                  {instalacion.tipo === 'android' && (
                    <BotonDegradado texto="Instalar" onPress={instalacion.instalar} pequeno />
                  )}
                </View>
                <Pressable accessibilityLabel="Cerrar" hitSlop={10} onPress={() => setVerAyuda(false)}>
                  <Text style={s.cerrar}>✕</Text>
                </Pressable>
              </View>
            )}

            {mostrarAjustes && (
              <View style={s.tarjeta}>
                <Text style={s.seccion}>Tu trabajo</Text>
                <Text style={s.seccionTexto}>Solo se usa para calcular y se guarda en tu móvil.</Text>
                <Campo
                  s={s}
                  c={c}
                  etiqueta="Sueldo neto al mes"
                  valor={sueldo}
                  onChange={setSueldo}
                  placeholder="1.800"
                  sufijo="€"
                />
                <Text style={s.etiqueta}>Pagas al año</Text>
                <View style={s.segmento}>
                  {[12, 14].map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPagas(p)}
                      style={[s.segmentoOpcion, pagas === p && s.segmentoActivo]}
                    >
                      <Text style={[s.segmentoTexto, pagas === p && s.segmentoTextoActivo]}>{p} pagas</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={s.fila}>
                  <View style={{ flex: 1 }}>
                    <Campo
                      s={s}
                      c={c}
                      etiqueta="Horas a la semana"
                      valor={horas}
                      onChange={setHoras}
                      placeholder="40"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Campo s={s} c={c} etiqueta="Días a la semana" valor={dias} onChange={setDias} placeholder="5" />
                  </View>
                </View>
                {g ? (
                  <BotonDegradado texto="Calcular" onPress={() => setEditando(false)} />
                ) : (
                  <Text style={s.aviso}>Rellena tu sueldo y tu horario para empezar.</Text>
                )}
              </View>
            )}

            {g && !mostrarAjustes && (
              <View style={s.tarjeta}>
                <Text style={s.seccion}>¿Qué quieres comprar?</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.ejemplos}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
                >
                  {EJEMPLOS.map((e) => (
                    <Pressable
                      key={e.nombre}
                      onPress={() => elegirEjemplo(e)}
                      style={({ pressed }) => [s.ejemplo, pressed && { transform: [{ scale: 0.96 }] }]}
                    >
                      <Text style={s.ejemploTexto}>
                        {e.emoji} {e.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Campo
                  s={s}
                  c={c}
                  etiqueta="Precio"
                  valor={precio}
                  onChange={setPrecio}
                  placeholder="0"
                  sufijo="€"
                  grande
                />
                <Campo
                  s={s}
                  c={c}
                  etiqueta="Qué es (opcional)"
                  valor={nombre}
                  onChange={cambiarNombre}
                  placeholder="Móvil nuevo, viaje, zapatillas…"
                  texto
                />
              </View>
            )}

            {g && !mostrarAjustes && coste && (
              <Resultado
                s={s}
                c={c}
                coste={coste}
                diasTotales={coste.horasTotales / g.horasDia}
                diasSemana={ajustes.diasSemana}
                emoji={emoji ?? (nombre.trim() ? adivinarEmoji(nombre) : null)}
                onGuardar={guardarDeseo}
              />
            )}

            {g && !mostrarAjustes && deseos.length > 0 && (
              <Lista
                s={s}
                deseos={deseos}
                ajustes={ajustes}
                onQuitar={(id) => setDeseos(deseos.filter((x) => x.id !== id))}
              />
            )}

            <Pressable onPress={compartir} style={s.compartir}>
              <Text style={s.compartirTexto}>{copiado ? 'Enlace copiado ✓' : '↗  Compartir la app'}</Text>
            </Pressable>
            <Text style={s.pie}>Tus datos se guardan solo en este móvil. Sin cuentas, sin nube.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Resultado(props: {
  s: Estilos;
  c: Colores;
  coste: Coste;
  diasTotales: number;
  diasSemana: number;
  emoji: string | null;
  onGuardar: () => void;
}) {
  const { s, c, coste } = props;
  const aparicion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(aparicion, { toValue: 1, useNativeDriver: Platform.OS !== 'web', friction: 7 }).start();
  }, []);

  const principal =
    coste.dias > 0 ? `${coste.dias} ${coste.dias === 1 ? 'día' : 'días'}` : textoHoras(coste.horasTotales);
  const resto = coste.dias > 0 && coste.horasRestantes >= 1 / 60 ? `y ${textoHoras(coste.horasRestantes)} ` : '';

  return (
    <Animated.View
      style={[
        s.tarjeta,
        {
          opacity: aparicion,
          transform: [{ translateY: aparicion.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <View style={s.resultadoCabecera}>
        <Text style={s.resultadoEtiqueta}>TE CUESTA</Text>
        {props.emoji && <Text style={{ fontSize: 26 }}>{props.emoji}</Text>}
      </View>
      <Text style={s.resultadoNumero}>{principal}</Text>
      <Text style={s.resultadoTexto}>{resto}de trabajo</Text>
      <View style={s.resultadoExtra}>
        <Text style={s.resultadoExtraTexto}>{textoExtra(coste)}</Text>
      </View>
      <View style={{ marginTop: 18, marginBottom: 18 }}>
        <Semanas dias={props.diasTotales} diasSemana={props.diasSemana} c={c} />
      </View>
      <BotonDegradado texto="♥  Añadir a mi lista" onPress={props.onGuardar} />
    </Animated.View>
  );
}

function Lista(props: { s: Estilos; deseos: Deseo[]; ajustes: Ajustes; onQuitar: (id: string) => void }) {
  const { s, deseos, ajustes } = props;
  const total = deseos.reduce((t, d) => t + d.precio, 0);
  const costeTotal = costeEnTiempo(total, ajustes);
  const maximo = Math.max(...deseos.map((d) => d.precio));

  return (
    <View style={s.tarjeta}>
      <View style={s.listaCabecera}>
        <Text style={[s.seccion, { marginBottom: 0 }]}>Mi lista</Text>
        <Text style={s.listaCuenta}>
          {deseos.length} {deseos.length === 1 ? 'cosa' : 'cosas'}
        </Text>
      </View>
      {deseos.map((d) => (
        <View key={d.id} style={s.deseo}>
          <View style={s.deseoEmoji}>
            <Text style={{ fontSize: 22 }}>{d.emoji ?? adivinarEmoji(d.nombre)}</Text>
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={s.deseoNombre} numberOfLines={1}>
              {d.nombre}
            </Text>
            <View style={s.barra}>
              <LinearGradient
                colors={degradado}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.barraRelleno, { width: `${Math.max(4, (d.precio / maximo) * 100)}%` }]}
              />
            </View>
            <View style={s.deseoFila}>
              <Text style={s.deseoPrecio}>{euros(d.precio)}</Text>
              <Text style={s.deseoCoste}>{textoCoste(costeEnTiempo(d.precio, ajustes))}</Text>
            </View>
          </View>
          <Pressable accessibilityLabel={`Quitar ${d.nombre}`} hitSlop={10} onPress={() => props.onQuitar(d.id)}>
            <Text style={s.cerrar}>✕</Text>
          </Pressable>
        </View>
      ))}
      <LinearGradient colors={degradado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.total}>
        <Text style={s.totalEtiqueta}>TODO JUNTO · {euros(total)}</Text>
        <Text style={s.totalNumero}>{textoCoste(costeTotal)}</Text>
        <View style={s.totalExtra}>
          <Text style={s.totalExtraTexto}>{textoExtra(costeTotal)} de trabajo</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <View style={estilosClaro.chip}>
      <Text style={estilosClaro.chipTexto}>{children}</Text>
    </View>
  );
}

function Campo(props: {
  s: Estilos;
  c: Colores;
  etiqueta: string;
  valor: string;
  onChange: (t: string) => void;
  placeholder?: string;
  sufijo?: string;
  texto?: boolean;
  grande?: boolean;
}) {
  const { s } = props;
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.etiqueta}>{props.etiqueta}</Text>
      <View style={[s.campo, foco && s.campoFoco]}>
        <TextInput
          style={[s.input, props.grande && s.inputGrande]}
          value={props.valor}
          onChangeText={props.onChange}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          placeholder={props.placeholder}
          placeholderTextColor={props.c.placeholder}
          keyboardType={props.texto ? 'default' : 'decimal-pad'}
          returnKeyType="done"
        />
        {props.sufijo && <Text style={[s.sufijo, props.grande && s.sufijoGrande]}>{props.sufijo}</Text>}
      </View>
    </View>
  );
}

function BotonDegradado({ texto, onPress, pequeno }: { texto: string; onPress: () => void; pequeno?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { borderRadius: 16, alignSelf: pequeno ? 'flex-start' : 'stretch', marginTop: pequeno ? 10 : 4 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={degradado}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[estilosClaro.boton, pequeno && { paddingVertical: 9, paddingHorizontal: 20 }]}
      >
        <Text style={estilosClaro.botonTexto}>{texto}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const redondear = (n: number) => Math.round(n * 100) / 100;

const estilos = (c: Colores) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: c.fondo },
    centrado: { maxWidth: 560, width: '100%', alignSelf: 'center' },
    cabecera: {
      paddingHorizontal: 22,
      paddingBottom: 64,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
    },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
    logo: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2.5,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoTexto: { color: '#fff', fontFamily: fuente.titulo, fontSize: 15, marginTop: -1 },
    marcaTexto: { color: '#fff', fontFamily: fuente.medio, fontSize: 17, flex: 1 },
    pastilla: {
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    pastillaTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
    heroEtiqueta: { color: 'rgba(255,255,255,0.88)', fontSize: 16, fontWeight: '600' },
    heroNumero: { color: '#fff', fontFamily: fuente.titulo, fontSize: 64, lineHeight: 72, letterSpacing: -1.5 },
    heroTitulo: { color: '#fff', fontFamily: fuente.titulo, fontSize: 36, lineHeight: 40, letterSpacing: -0.8 },
    heroTexto: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 23, marginTop: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    chip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    chipTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },

    contenido: { paddingHorizontal: 16, marginTop: -40, gap: 16 },
    tarjeta: {
      backgroundColor: c.tarjeta,
      borderRadius: 26,
      padding: 20,
      borderWidth: 1,
      borderColor: c.borde,
      shadowColor: c.sombra,
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 3,
    },
    seccion: { fontFamily: fuente.titulo, fontSize: 22, color: c.texto, marginBottom: 14, letterSpacing: -0.3 },
    seccionTexto: { fontSize: 14, color: c.suave, marginTop: -8, marginBottom: 18 },
    etiqueta: { fontSize: 13, color: c.suave, marginBottom: 7, fontWeight: '700' },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.borde,
      borderRadius: 16,
      backgroundColor: c.campo,
      paddingHorizontal: 16,
    },
    campoFoco: { borderColor: c.acento },
    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 13,
      fontSize: 17,
      color: c.texto,
      fontWeight: '600',
      outlineWidth: 0, // en la web, quita el borde azul del navegador
    },
    inputGrande: { fontFamily: fuente.titulo, fontSize: 34, fontWeight: undefined, paddingVertical: 8 },
    sufijo: { fontSize: 17, color: c.suave, fontWeight: '700', marginLeft: 8 },
    sufijoGrande: { fontFamily: fuente.titulo, fontSize: 28 },
    fila: { flexDirection: 'row', gap: 12 },
    segmento: {
      flexDirection: 'row',
      backgroundColor: c.campo,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1.5,
      borderColor: c.borde,
      marginBottom: 14,
    },
    segmentoOpcion: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    segmentoActivo: { backgroundColor: c.texto },
    segmentoTexto: { fontSize: 15, color: c.texto, fontWeight: '700' },
    segmentoTextoActivo: { color: c.fondo },
    aviso: { fontSize: 14, color: c.suave, textAlign: 'center', marginTop: 4 },

    ejemplos: { marginHorizontal: -20, marginBottom: 16 },
    ejemplo: {
      backgroundColor: c.acentoSuave,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    ejemploTexto: { fontSize: 14, color: c.texto, fontWeight: '700' },

    resultadoCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resultadoEtiqueta: { fontSize: 12, color: c.suave, fontWeight: '800', letterSpacing: 1.5 },
    resultadoNumero: {
      fontFamily: fuente.titulo,
      fontSize: 56,
      lineHeight: 62,
      color: c.acentoTexto,
      letterSpacing: -1.5,
      marginTop: 2,
    },
    resultadoTexto: { fontSize: 18, color: c.texto, fontWeight: '600' },
    resultadoExtra: {
      alignSelf: 'flex-start',
      backgroundColor: c.acentoSuave,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginTop: 12,
    },
    resultadoExtraTexto: { color: c.acentoTexto, fontWeight: '800', fontSize: 13 },

    listaCabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 6,
    },
    listaCuenta: { color: c.suave, fontWeight: '700', fontSize: 13 },
    deseo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.borde,
    },
    deseoEmoji: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: c.acentoSuave,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deseoFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
    deseoNombre: { fontSize: 16, color: c.texto, fontWeight: '700', flexShrink: 1 },
    deseoCoste: { fontFamily: fuente.medio, fontSize: 15, color: c.acentoTexto },
    deseoPrecio: { fontSize: 13, color: c.suave },
    barra: { height: 6, borderRadius: 3, backgroundColor: c.vacio, overflow: 'hidden' },
    barraRelleno: { height: '100%', borderRadius: 3 },
    total: { marginTop: 16, borderRadius: 22, padding: 18 },
    totalEtiqueta: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
    totalNumero: { color: '#fff', fontFamily: fuente.titulo, fontSize: 30, lineHeight: 34, marginTop: 4 },
    totalExtra: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginTop: 10,
    },
    totalExtraTexto: { color: '#fff', fontSize: 13, fontWeight: '800' },

    ayuda: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    ayudaTitulo: { fontFamily: fuente.medio, fontSize: 16, color: c.texto, marginBottom: 4 },
    ayudaTexto: { fontSize: 14, color: c.suave, lineHeight: 20 },
    cerrar: { fontSize: 15, color: c.suave, paddingHorizontal: 4 },

    boton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    botonTexto: { color: '#fff', fontSize: 16, fontWeight: '800' },
    compartir: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, marginTop: 4 },
    compartirTexto: { color: c.acentoTexto, fontWeight: '800', fontSize: 15 },
    pie: { fontSize: 13, color: c.suave, textAlign: 'center', marginTop: -10 },
  });

type Estilos = ReturnType<typeof estilos>;
const estilosClaro = estilos(claro);
const estilosOscuro = estilos(oscuro);
