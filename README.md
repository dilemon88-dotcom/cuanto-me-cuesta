# ¿Cuánto me cuesta?

App para Android e iOS que convierte el precio de lo que quieres comprar en **tiempo de trabajo**.

Metes tu sueldo neto, las pagas al año y tu horario, y la app te dice cuánto ganas por hora y por día. Luego escribes el precio de algo y te dice cuántos días y horas tienes que trabajar para pagarlo.

> Ejemplo: con 1.800 € netos al mes (12 pagas) y 40 h/semana, un móvil de 1.500 € cuesta **18 días y 27 min** de trabajo.

## Funciones

- Cálculo de lo que ganas por hora y por día (12 o 14 pagas).
- Coste de cualquier compra en días, horas y semanas o meses de trabajo.
- Lista de deseos con el total.
- Todo se guarda solo en el móvil. Sin cuentas y sin nube.

## Cómo se calcula

```
sueldo anual   = sueldo neto mensual × pagas
€ por hora     = sueldo anual ÷ (horas por semana × 52)
horas por día  = horas por semana ÷ días por semana
coste en horas = precio ÷ € por hora
```

La lógica está en [`src/calculo.ts`](src/calculo.ts) y la pantalla en [`App.tsx`](App.tsx).

## Probarla

Hace falta [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npx expo start
```

- **En el móvil:** instala *Expo Go* (App Store o Google Play) y escanea el código QR que sale en la terminal. El móvil y el ordenador tienen que estar en la misma wifi.
- **En el navegador:** pulsa `w` en la terminal.

Hecha con [Expo](https://expo.dev) (React Native + TypeScript).
