# ¿Cuánto me cuesta?

App para el móvil que convierte el precio de lo que quieres comprar en **tiempo de trabajo**.

Metes tu sueldo neto, las pagas al año y tu horario, y la app te dice cuánto ganas por hora y por día. Luego escribes el precio de algo y te dice cuántos días y horas tienes que trabajar para pagarlo.

> Ejemplo: con 1.800 € netos al mes (12 pagas) y 40 h/semana, un móvil de 1.500 € cuesta **18 días y 27 min** de trabajo.

## Úsala

**👉 https://dilemon88-dotcom.github.io/cuanto-me-cuesta/**

Ábrela en el móvil e instálala para tenerla con su icono en la pantalla de inicio:

- **iPhone:** ábrela en **Safari** → botón **Compartir** (el cuadrado con la flecha hacia arriba) → **Añadir a pantalla de inicio**.
- **Android:** ábrela en **Chrome** → pulsa **Instalar** en el aviso de la app, o menú **⋮** → **Instalar aplicación** / **Añadir a pantalla de inicio**.

Una vez instalada se abre a pantalla completa y funciona sin internet.

## Funciones

- Cálculo de lo que ganas por hora y por día (12 o 14 pagas).
- Coste de cualquier compra en días, horas y semanas o meses de trabajo.
- Lista de deseos con el total.
- Modo oscuro automático, según el ajuste del móvil.
- Botón para compartir la app.
- Todo se guarda solo en el móvil. Sin cuentas y sin nube.

## Cómo se calcula

```
sueldo anual   = sueldo neto mensual × pagas
€ por hora     = sueldo anual ÷ (horas por semana × 52)
horas por día  = horas por semana ÷ días por semana
coste en horas = precio ÷ € por hora
```

La lógica está en [`src/calculo.ts`](src/calculo.ts) y la pantalla en [`App.tsx`](App.tsx).

## Desarrollo

Hace falta [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npx expo start
```

- **En el móvil:** instala *Expo Go* (App Store o Google Play) y escanea el código QR que sale en la terminal. El móvil y el ordenador tienen que estar en la misma wifi.
- **En el navegador:** pulsa `w` en la terminal.

### Publicar la web

Cada vez que se sube algo a `main`, GitHub compila la versión web y la publica sola en la dirección de arriba ([`.github/workflows/publicar-web.yml`](.github/workflows/publicar-web.yml)). Para probar la compilación en local:

```bash
npx expo export -p web   # genera la carpeta dist/
```

La parte que la hace instalable y que funcione sin conexión está en [`public/`](public): `index.html`, `manifest.webmanifest`, `sw.js` y los iconos.

### Publicar en las tiendas (más adelante)

El proyecto ya tiene identificador (`com.dilemon88.cuantomecuesta`) y configuración de compilación ([`eas.json`](eas.json)). Hace falta una cuenta gratuita de [Expo](https://expo.dev) y:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile apk        # APK para instalar en Android sin pasar por la tienda
eas build -p android --profile production # para Google Play
eas build -p ios --profile production     # para App Store / TestFlight
eas submit -p android                      # o -p ios, para subirla a la tienda
```

- **Google Play:** cuenta de desarrollador de 25 € (pago único). Las cuentas personales nuevas tienen que hacer una prueba cerrada con al menos 12 personas durante 14 días antes de publicar.
- **App Store:** Apple Developer Program, 99 €/año. Con TestFlight puedes invitar a familia y amigos antes de publicarla.

Hecha con [Expo](https://expo.dev) (React Native + TypeScript).
