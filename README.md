# Maratón MTY

**En vivo: https://missaelsandoval.github.io/maraton-mty/**

PWA de seguimiento del plan de entrenamiento hacia el **Maratón Powerade
Monterrey** (domingo 13-dic-2026, Parque Fundidora).

Sin build, sin dependencias: son archivos estáticos. Se sirven tal cual.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Shell: cuatro vistas + hoja de captura |
| `styles.css` | Mobile-first, safe areas de iOS, modo claro/oscuro |
| `app.js` | Toda la lógica: vistas, estado, localStorage, export |
| `plan.js` | **El plan en datos.** Lo único que se toca si cambia el plan |
| `sw.js` | Service worker: red primero, cache como respaldo → funciona sin señal |
| `manifest.webmanifest` | Nombre, íconos, `display: standalone` |
| `icons/` | Generados con Pillow desde el scratchpad |

## Dónde viven los datos

En el **localStorage del iPhone**, bajo la clave `mmty-log-v1`. No hay servidor
ni cuenta: nada sale del teléfono. Consecuencia: si se borran los datos de
Safari o se cambia de teléfono, se pierde lo no exportado. La pestaña
**Exportar** tiene "Descargar respaldo (.json)" y "Restaurar desde respaldo".

## Probar en local

```bash
python -m http.server 8765 --directory marathon-app
```

Luego `http://localhost:8765`. En Claude Code: `preview_start` con la config
`marathon-app` de `.claude/launch.json`.

## Instalar en el iPhone

1. Abrir la URL publicada **en Safari** (no Chrome — solo Safari instala PWAs en iOS).
2. Botón Compartir → **Agregar a pantalla de inicio**.
3. Abrirla desde el ícono: se ve a pantalla completa, sin barra del navegador.

## Actualizar el plan

1. Regenerar o editar `plan.js`.
2. **Subir `CACHE` en `sw.js`** (`mmty-v4` → `mmty-v5`). Sin esto, los teléfonos
   con la app abierta se quedan con la copia vieja hasta que la cache expire.
3. Publicar. La app pide red primero, así que al siguiente arranque con señal
   ya trae el plan nuevo.

### Por qué el service worker pide red primero

La estrategia habitual (cache primero) es más rápida pero deja el plan
congelado en el teléfono. Aquí importa más que el plan esté al día que ahorrar
200 ms. Todas las peticiones van con `cache: 'no-store'` / `'reload'`: sin eso,
`fetch()` dentro del worker pasa por la cache HTTP del navegador y termina
guardando un `index.html` rancio que pide archivos ausentes de la cache — la
app abre en blanco sin señal. El registro usa `updateViaCache: 'none'` por la
misma razón, aplicada al propio `sw.js`.

## Estructura del plan (`plan.js`)

```js
const PLAN = {
  race:   { name, date, time, location, distanceKm },
  startDate: "2026-08-10",
  weeks: [{
    num, start, end, phase, phaseLabel, deload,
    targetKm,   // = suma exacta de los km de sus sesiones
    longKm,
    sessions: [{ id, date, dow, type, km, desc }]
  }]
}
```

`id` es `s<YYYY-MM-DD>` y es la llave del registro en localStorage — si cambian
las fechas del plan, los registros viejos quedan huérfanos.

`type` ∈ `descanso · facil · calidad · largo · cruzado · carrera`.

**Invariante:** `targetKm` de cada semana debe ser igual a la suma de los `km`
de sus sesiones, o los totales y las barras de progreso no cuadran.
