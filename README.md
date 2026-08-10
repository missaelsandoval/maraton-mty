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

## Traer datos de la app Salud

Safari no puede leer HealthKit — no existe API web, y Web Bluetooth tampoco
está en iOS. El puente es **Atajos**, que sí lee Salud, corre en el teléfono y
no manda nada a ningún servidor.

### El formato

Líneas, no JSON: Atajos produce texto plano con un bloque `Texto` y ya;
construir JSON válido ahí es doloroso. Además se lee y se corrige a ojo.

```
FCR   2026-08-04 69        · frecuencia en reposo, ppm
PESO  2026-08-04 109.2     · kg (acepta coma decimal: 109,2)
SUENO 2026-08-04 380       · minutos dormidos
ENT   2026-08-04 3.2 36 142 · km, minutos, FC media (la FC es opcional)
```

Separadores: espacios o `;`. **Coma no** — se usa para decimales. La fecha va
en `YYYY-MM-DD`. Las etiquetas no distinguen mayúsculas. Las líneas que no
encajan se ignoran y se reportan; nunca tumban la importación.

`ENT` se cruza con la sesión del plan de esa fecha: si no hay sesión ese día,
se ignora. Los campos que ya tenías capturados a mano (sensación, notas) se
conservan.

### El Atajo ya viene hecho

No hay que armarlo acción por acción. `tools/build-shortcut.py` lo genera y lo
firma:

```bash
python3 marathon-app/tools/build-shortcut.py
```

Deja `tools/dist/Salud a Maraton.shortcut`. Para instalarlo: mandarlo al iPhone
(AirDrop, Archivos u OneDrive), abrirlo y tocar **Añadir atajo**. La primera
corrida pide permiso de lectura a Salud — hay que concederlo por tipo de dato.

Firmar solo se puede desde la Mac: `shortcuts sign` no existe en iOS, y desde
iOS 15 un atajo sin firma no se puede importar. Por eso el script vive aquí y
no es un instructivo.

Luego, en el iPhone: correr el atajo → en la app, **Exportar → Importar de
Salud**.

> Si iOS niega la lectura del portapapeles, la app abre sola un cuadro para
> pegar a mano. El botón **Pegar a mano…** hace lo mismo a propósito.

### Qué trae y qué no

| Línea | De dónde sale | Estado |
|---|---|---|
| `FCR` | Frecuencia en reposo | **del atajo** |
| `PESO` | Peso corporal | **del atajo** |
| `SUENO` | Sueño | a mano, si lo quieres |
| `ENT` | Entrenamientos | a mano en la app |

Quedaron dos fuera, y en los dos casos fue a propósito.

**Los entrenamientos no se pueden leer.** Atajos solo expone
`filter.health.quantity`, que busca *muestras* (números sueltos con fecha); no
existe ninguna acción que enumere entrenamientos pasados con distancia,
duración y FC media. Solo hay iniciar, terminar y registrar uno nuevo. La
tentación es usar *Walking + Running Distance* agrupado por día, pero eso suma
el caminar de la oficina y la casa: en una semana normal duplicaría los
kilómetros del plan. Tampoco existe un tipo "solo correr" — HealthKit tiene
`RunningSpeed` y `RunningPower`, pero ninguna distancia separada del caminar.

No es gran pérdida: al registrar una carrera en la app también capturas
sensación y notas, que el reloj no sabe. Lo tedioso —los números diarios que
nadie quiere transcribir— sí lo cubre el atajo.

**El sueño se guarda como código de etapa, no como minutos.** Es una muestra de
*categoría*: su valor es `0` en cama, `1` dormido, `2` despierto, `3` ligero,
`4` profundo, `5` REM. Un bloque ingenuo escribiría `SUENO <fecha> 3` y la
gráfica mostraría tres horas de sueño — creíble, y falso. Sacarlo bien pide
sumar la propiedad *Duración* solo de las etapas dormidas (las de "en cama" se
enciman con las de dormido y contarían doble), y eso no se puede verificar sin
el iPhone. Preferí no incluirlo antes que ensuciar la bitácora en silencio.

Si algún día quieres el sueño: la app **sí** acepta líneas `SUENO` pegadas a
mano, en minutos o en horas (un valor ≤ 24 lo interpreta como horas).

### Cómo está armado (y por qué duele)

Tres cosas del formato de Atajos que no son evidentes y costaron encontrar:

- **El tipo de muestra no es un parámetro.** "Buscar muestras de salud" hereda
  de `WFContentItemFilterAction`, así que el tipo va como una fila de la tabla
  de filtros, con `Property = "Type"`. En el binario de Apple,
  `readableSampleType` ni siquiera es un campo guardado: es un getter que va a
  leer esa fila.
- **El valor es la etiqueta en inglés, no el identificador.** Se guarda
  `"Weight"`, no `HKQuantityTypeIdentifierBodyMass`. Va en inglés aunque el
  teléfono esté en español. Salen de `Localizable-DataTypes.loctable` de
  HealthKit.
- **"Agrupar por día" suma, no promedia.** La descripción del parámetro lo dice
  sin adornos: *"grouping by day gives you only the daily totals"*. Sirve para
  pasos; para frecuencia en reposo, un día con dos muestras de 55 reporta 110.
  Por eso el atajo no agrupa: prefiere dos líneas del mismo día —la app fusiona
  por fecha— antes que una línea sumada.
- **`shortcuts sign` decide por la extensión.** Si el archivo de entrada no se
  llama `.shortcut` responde *"isn't in the correct format"*, aunque el plist
  sea idéntico y válido.

Y una advertencia: `shortcuts sign` **no valida nada**. Firma feliz un atajo con
acciones inventadas. Que el archivo se genere no prueba que corra; eso solo se
sabe en el teléfono.

> El `.shortcut` que está en `dist/` **sí se probó en el iPhone** (agosto 2026):
> se importa, pide permisos de Salud y deja las líneas en el portapapeles. Si
> alguien regenera el atajo, esa verificación ya no aplica al archivo nuevo.

### Qué hace con eso

- **Frecuencia en reposo** — implementa la regla de alto del plan: 3 días
  consecutivos con FCR ≥ base+7 muestran una alerta en *Hoy*. La base son 69
  ppm hasta que haya 14+ muestras; de ahí en adelante es la mediana de las
  tuyas (la mediana aguanta días sueltos altos sin desplazarse).
- **Peso y sueño** — tendencia de 30 días en *Plan → Tu cuerpo*, con la línea
  punteada del umbral.
- **Entrenamientos** — se capturan en la app, no vienen del atajo (ver arriba).
  El export los saca con FC media, si la anotaste, y con la FC en reposo de ese
  día, que sí viene del atajo.

## Actualizar el plan

1. Regenerar o editar `plan.js`.
2. **Subir `CACHE` en `sw.js`** (p. ej. `mmty-v7` → `mmty-v8`). Sin esto, los teléfonos
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
