/* Guía de ejecución — el "cómo se hace" de cada sesión.

   Por qué existe: plan.js dice QUÉ ("4 km + 6 rectas de 20 s"). Eso alcanza
   para recordar, no para aprender. Este archivo dice CÓMO se ejecuta, PARA QUÉ
   sirve y CUÁL es el error típico, y la app lo pinta debajo de la descripción.

   plan.js es generado y no se toca a mano; esto vive aparte a propósito: se
   puede ampliar sin regenerar el plan, y si un día no carga, la app sigue
   funcionando igual (app.js lo usa solo si existe).

   Los ritmos NO se escriben a mano: salen de PLAN.zonas, para que el día que
   cambien las zonas cambien aquí también. */

const _Z = (nombre) => {
  const z = ((typeof PLAN !== 'undefined' && PLAN.zonas) || []).find(x => x.zona === nombre);
  return z ? `${z.minkm}/km · ${z.kmh} km/h · ${z.mph} mph` : '';
};
const _SENS = (nombre) => {
  const z = ((typeof PLAN !== 'undefined' && PLAN.zonas) || []).find(x => x.zona === nombre);
  return z ? z.sensacion.toLowerCase() : '';
};
/* ¿El ritmo objetivo de la sesión es el de esta zona? Se compara contra
   PLAN.zonas en vez de contra un texto fijo, para que siga funcionando si un
   día se recalibran las zonas. Sirve para reconocer los días de calidad cuyo
   rodaje base va en fácil. */
const _EN_ZONA = (s, nombre) => {
  const z = ((typeof PLAN !== 'undefined' && PLAN.zonas) || []).find(x => x.zona === nombre);
  return !!(z && s.pace && s.pace.indexOf(z.minkm) === 0);
};

/* Orden = prioridad. Lo específico de la sesión primero, el contexto después:
   en un rodaje con rectas, lo que hay que leer hoy son las rectas. */
const GUIA = [

  // ── Técnica dentro de un rodaje ─────────────────────────────────────────
  {
    id: 'rectas',
    titulo: 'Rectas (strides)',
    cuando: s => /recta/i.test(s.desc || ''),
    que: `Son aceleraciones cortas y sueltas de unos 20 segundos que se hacen AL TERMINAR el rodaje, no en medio. No son series ni esprints: no buscan cansarte, buscan recordarle a la pierna cómo se mueve rápido. Terminas la sesión más suelto que si solo hubieras trotado.`,
    pasos: [
      'Termina primero los kilómetros fáciles del día, completos y al ritmo de siempre.',
      'Busca un tramo plano y despejado de unos 100–120 m: una calle sin coches, una pista, un camellón largo.',
      'Arranca trotando y sube la velocidad de forma progresiva: los primeros 5 s suave, a los 10 s ya vas rápido, los últimos 5–8 s a tu velocidad más fluida y cómoda. Nunca al 100 %.',
      'Suelta y desacelera poco a poco — no frenes de golpe.',
      'Camina o trota 60–90 s, hasta recuperar el aliento POR COMPLETO. Esa pausa no es opcional: es la que hace que la siguiente salga igual de buena.',
      'Repite hasta completar las seis. Con las pausas te lleva unos 8–10 minutos en total.',
    ],
    porque: `Mejoran la técnica y la economía de carrera (gastas menos oxígeno al mismo ritmo) a un costo de fatiga casi nulo. Por eso caben dentro de un día fácil sin convertirlo en un día duro.`,
    ojo: `Si acabas jadeando, con las piernas cargadas, o la sexta te sale claramente más lenta que la primera, ibas demasiado rápido. La referencia es "rápido y suelto", no "rápido y apretado": hombros bajos, mandíbula floja, zancada que se abre sola.`,
  },
  {
    id: 'progresivo',
    titulo: 'Terminar en progresivo',
    // "km progresivos", no el "acelera progresivo" que describe las rectas.
    cuando: s => /km\s+progresiv/i.test(s.desc || ''),
    que: `Los últimos kilómetros se corren cada uno un poco más rápido que el anterior, terminando alrededor del ritmo maratón (${_Z('Ritmo maratón')}).`,
    pasos: [
      'Corre la primera parte en zona fácil, sin adelantarte.',
      'En el penúltimo kilómetro sube un escalón: de fácil a algo más vivo, sin brusquedad.',
      'El último kilómetro, ritmo maratón. Ahí se termina — no se busca el límite.',
    ],
    porque: 'Enseña al cuerpo a acelerar con las piernas ya cansadas, que es exactamente lo que pide el kilómetro 35 del maratón.',
    ojo: 'Debes cruzar el final pudiendo seguir. Si acabas vaciado, empezaste demasiado rápido el bloque.',
  },

  // ── Sesiones de calidad ─────────────────────────────────────────────────
  {
    id: 'tempo',
    titulo: 'Tempo (umbral)',
    cuando: s => /tempo/i.test(s.desc || ''),
    que: `"Fuerte" en el plan quiere decir zona umbral: ${_Z('Umbral / tempo')} — ${_SENS('Umbral / tempo')}. Es un esfuerzo sostenido e incómodo, pero controlado: el ritmo más rápido que podrías sostener unos 45–60 minutos si te obligaran. No es correr al máximo.`,
    pasos: [
      'Calentamiento ("cal"): los primeros 2 km en zona fácil, sin prisa. Suben la temperatura y despiertan la zancada; saltárselos convierte el bloque fuerte en un tirón en frío.',
      'Entra al bloque fuerte de forma gradual, dándote los primeros 300–400 m para llegar al ritmo. No arranques de golpe.',
      'Sostén ese ritmo lo más parejo posible. Revisa el reloj cada kilómetro, no cada 100 m.',
      'Si el bloque viene partido (2 × 2 km, por ejemplo), la recuperación entre bloques es trote muy suave o caminata: sin sentarte ni quedarte parado.',
      'Enfriamiento: los kilómetros finales en zona fácil o de recuperación. Bajan la frecuencia cardiaca poco a poco y mejoran cómo amaneces mañana.',
    ],
    porque: `Sube el umbral, que es el punto a partir del cual el cuerpo ya no alcanza a limpiar el lactato que produce. Subirlo hace que el ritmo maratón se sienta cada vez más cómodo.`,
    ojo: `El error clásico es salir demasiado rápido y terminar el bloque a rastras. Si el segundo bloque sale más lento que el primero, saliste fuerte. Parejo le gana a rápido, siempre.`,
  },
  {
    id: 'intervalos',
    titulo: 'Intervalos',
    cuando: s => /intervalo|×\s*1\s*km|x\s*1\s*km/i.test(s.desc || ''),
    que: `Repeticiones rápidas separadas por trote de recuperación. La zona es ${_Z('Intervalos')} — ${_SENS('Intervalos')}.`,
    pasos: [
      'Calienta los 2 km iniciales en zona fácil. Aquí el calentamiento no es negociable: se entra a ritmo alto.',
      'Cada repetición, ritmo parejo de principio a fin. La primera debe salir igual que la última.',
      'La recuperación es TROTE suave, no pararse. Detenerse enfría la pierna y hace que la siguiente cueste más.',
      'Si al llegar a la cuarta ya no puedes sostener el ritmo, corta ahí y enfría. Una repetición de menos no arruina nada; forzarla sí.',
      'Cierra con los kilómetros de enfriamiento en zona fácil.',
    ],
    porque: 'Trabajan la potencia aeróbica y la mecánica a velocidad alta. En un plan de maratón son la minoría, y justo por eso hay que hacerlas bien, no muchas.',
    ojo: 'No es una carrera contra ti mismo. Si la primera repetición sale espectacular, casi seguro arruinaste las cuatro siguientes.',
  },
  {
    id: 'ritmo-maraton',
    titulo: 'Bloque a ritmo maratón',
    cuando: s => /ritmo marat/i.test(s.desc || ''),
    que: `El tramo se corre al ritmo objetivo del día de la carrera: ${_Z('Ritmo maratón')} — ${_SENS('Ritmo maratón')}. Es el único momento del plan donde el número del reloj importa de verdad.`,
    pasos: [
      'Entra al bloque sin acelerón: sube al ritmo en unos 200–300 m.',
      'Revisa el ritmo cada kilómetro y corrige poco a poco. Perseguir el ritmo instantáneo del reloj te hace ir en sierra.',
      'Si el bloque va al final de un largo, espera que se sienta más duro de lo normal. Ese es el punto: ensayar el ritmo con las piernas ya cansadas.',
      'Al terminar el bloque no te detengas: baja a zona fácil o a caminata para enfriar.',
    ],
    porque: 'El ritmo de carrera hay que tenerlo memorizado en las piernas, no en la cabeza. El día del maratón la emoción de la salida te va a empujar a ir más rápido, y solo el hábito lo frena.',
    ojo: `Si no logras sostener el ritmo maratón en el bloque, no lo fuerces: es información valiosa sobre el objetivo, no un fracaso. Anótalo en las notas de la sesión.`,
  },
  {
    id: 'cuatrocientos',
    titulo: 'Repeticiones de 400 m',
    cuando: s => /400\s*m/i.test(s.desc || ''),
    que: `Cuatro tramos cortos a ritmo maratón (${_Z('Ritmo maratón')}) metidos dentro de un rodaje corto. En semana de carrera no buscan entrenar nada: buscan que la pierna recuerde el ritmo.`,
    pasos: [
      '400 m son una vuelta a una pista, o algo menos de 4 minutos a tu ritmo maratón.',
      'Entre repetición y repetición, 2–3 minutos de trote muy suave o caminata.',
      'Se termina con la sensación de "podría hacer diez más". Si no la tienes, fue demasiado.',
    ],
    porque: 'Mantiene despierto el sistema nervioso durante el afinamiento, cuando el volumen baja mucho y las piernas tienden a apagarse.',
    ojo: 'Estos días no se entrena, se afina. Ganar forma ya no se puede; perderla por hacer de más, sí.',
  },

  // ── Estrategia del largo ────────────────────────────────────────────────
  {
    id: 'cinco-uno',
    titulo: 'Trote–caminata 5:1',
    cuando: s => /5:1/i.test(s.desc || ''),
    que: `Cinco minutos de trote continuo, un minuto de caminata rápida, y otra vez, todo el rato. Desde el kilómetro 1 — no cuando te canses. Es la estrategia con la que vas a correr el maratón, por eso se ensaya en cada largo.`,
    pasos: [
      'Programa un temporizador de intervalos que suene y se repita solo (5:00 / 1:00). En el reloj: entrenamiento personalizado con dos tramos por tiempo, en bucle. En el teléfono sirve cualquier app de intervalos.',
      'Empieza a caminar el minuto EN CUANTO suene, aunque te sientas fresco. Ese es todo el truco: se camina antes de necesitarlo, no después.',
      'La caminata es rápida y con propósito (unos 6 km/h, paso de quien llega tarde), no un paseo. No te detengas ni te recargues.',
      'Vuelve a trotar apenas termine el minuto, sin negociar contigo mismo.',
      'Aprovecha los minutos de caminata para beber agua y tomar el gel: es mucho más fácil que en movimiento.',
    ],
    porque: `Reparte el impacto y mantiene la frecuencia cardiaca abajo, así que llegas al final del largo con piernas en lugar de con pura voluntad. En distancias largas suele dar un tiempo total igual o mejor que trotar sin parar, porque nunca llega el desplome de los últimos kilómetros.`,
    ojo: `Si el minuto de caminata se te convierte en dos o en tres, el trote iba demasiado rápido. Baja el ritmo del trote antes de alargar la caminata.`,
  },
  {
    id: 'largo',
    titulo: 'La tirada larga',
    cuando: s => s.type === 'largo',
    que: `Es la sesión que construye el maratón. Aquí no importa el ritmo, importa el tiempo de pie. Debe correrse cómodo: ${_Z('Fácil')}, o más lento todavía si hace calor.`,
    pasos: [
      'Sal temprano. En semanas de calor, la diferencia entre las 6 y las 9 de la mañana son 8–10 °C y una sesión completamente distinta.',
      'Arma la ruta en circuitos de 3–5 km que pasen por el coche o por la casa: puedes dejar ahí el agua y los geles en vez de cargarlos todo el camino.',
      'Bebe algo cada 20 minutos, aunque no tengas sed. Con calor, un trago largo; con fresco, uno corto.',
      'El ritmo correcto es aquel en el que podrías sostener una conversación completa. Si vas contando palabras, vas rápido.',
      'Al terminar: camina 5 minutos, come algo con carbohidrato y proteína dentro de la primera hora, y levanta las piernas un rato.',
    ],
    porque: 'Es donde se construyen las mitocondrias, los capilares y — sobre todo — la cabeza. El maratón se corre con lo que ya hiciste en los largos.',
    ojo: `La regla es terminar pudiendo seguir. Si el último tercio se volvió supervivencia, la semana siguiente no se sube el volumen: se repite o se baja.`,
  },
  {
    id: 'geles',
    titulo: 'Geles y bebida',
    cuando: s => /gel/i.test(s.desc || '') || (s.type === 'largo' && s.km >= 14),
    que: `A partir de los 60–75 minutos el músculo se queda sin glucógeno disponible y el ritmo se cae solo. Los geles evitan ese desplome, pero hay que ensayarlos: el estómago se entrena igual que la pierna.`,
    pasos: [
      'Primer gel al minuto 40, antes de tener hambre o de sentirte vacío. Después, uno cada 35–40 minutos.',
      'Siempre con agua, unos cuantos tragos. Un gel pasado con bebida deportiva concentrada es la receta más común del malestar estomacal.',
      'Tómalo durante un minuto de caminata: mucho más fácil y sin atragantarse.',
      'Usa siempre la misma marca y el mismo sabor con el que vas a correr el maratón.',
    ],
    porque: 'El "muro" del kilómetro 30 es, en buena parte, un problema de combustible. Se resuelve comiendo antes de necesitarlo.',
    ojo: `El día de la carrera no se estrena NADA: ni gel, ni bebida, ni sabor nuevo, ni lo que regalen en el avituallamiento si no lo has probado antes.`,
  },
  {
    id: 'simulacro',
    titulo: 'Simulacro de carrera',
    cuando: s => /simulacro/i.test(s.desc || ''),
    que: `Es el ensayo general: todo igual que el día del maratón, salvo la distancia. Sirve para descubrir los problemas ahora, cuando todavía se pueden arreglar.`,
    pasos: [
      'Misma hora de salida que la carrera (6:45 AM) y mismo desayuno, 2–3 horas antes.',
      'Misma ropa, mismos calcetines, mismos tenis, misma gorra, mismo cinturón de geles. Si algo roza, es mejor saberlo hoy.',
      '5:1 desde el kilómetro 1 y geles en el minuto marcado, no cuando te acuerdes.',
      'Los últimos kilómetros a ritmo maratón, con el cansancio ya encima.',
      'Al terminar, anota todo en las notas: qué rozó, qué cayó pesado, qué se te olvidó. Esa lista es tu plan del día de la carrera.',
    ],
    porque: 'Casi todo lo que sale mal en un maratón ya había dado señales en el simulacro.',
    ojo: 'No lo conviertas en una carrera. El objetivo es probar el protocolo, no batir un tiempo.',
  },

  // ── Días fáciles, cruzados y descanso ───────────────────────────────────
  {
    id: 'facil',
    titulo: 'Rodaje fácil',
    // También los días de calidad cuyo rodaje base va en zona fácil: ahí el
    // "4 km" de "4 km + 6 rectas" también necesita un ritmo, no solo las rectas.
    cuando: s => s.type === 'facil' || /f[áa]cil|suave|trote|continuo/i.test(s.desc || '')
              || _EN_ZONA(s, 'Fácil'),
    que: `La mayor parte del plan son estos kilómetros, y deben sentirse aburridamente cómodos: ${_Z('Fácil')} — ${_SENS('Fácil')}.`,
    pasos: [
      'Prueba de la conversación: si no puedes decir una frase completa sin cortarla para respirar, vas rápido. Baja.',
      'Si hace calor o dormiste mal, ve más lento sin culpa: el estímulo es el esfuerzo, no el número del reloj.',
      'Caminar un tramo no rompe nada. Un rodaje fácil con caminatas sigue siendo un rodaje fácil.',
    ],
    porque: 'Construyen la base aeróbica y la resistencia del tejido, y solo funcionan si te dejan recuperado para las sesiones que sí son duras.',
    ojo: `El error más común del corredor amateur es correr los días fáciles a medio gas: demasiado rápido para recuperar, demasiado lento para entrenar. Deja cansancio sin dar estímulo.`,
  },
  {
    id: 'cruzado',
    titulo: 'Cruzado (bici, elíptica, caminata)',
    cuando: s => s.type === 'cruzado' || /bici|el[íi]ptica|caminata/i.test(s.desc || ''),
    que: `Trabajo aeróbico sin impacto. Suma circulación y recuperación sin sumar el golpe repetido de la carrera.`,
    pasos: [
      'Esfuerzo de zona recuperación o fácil: deberías poder hablar todo el rato.',
      'En bici, cadencia alta y resistencia baja — piernas girando sueltas, no empujando fuerte.',
      'La caminata cuenta como sesión: rápida y sostenida, no un paseo con paradas.',
    ],
    porque: 'Mueve sangre a las piernas y acelera la reparación entre sesiones duras, sin añadir carga de impacto.',
    ojo: 'Si terminas cansado, no fue recuperación: fue otro entrenamiento, y mañana lo vas a pagar.',
  },
  {
    id: 'descanso',
    titulo: 'Descanso',
    cuando: s => s.type === 'descanso',
    que: `El descanso no es la ausencia del plan: es parte del plan. La adaptación — músculo, tendón, mitocondria — ocurre descansando, no corriendo.`,
    pasos: [
      'Camina lo normal del día, sin buscar sumar pasos.',
      'Duerme. Es la herramienta de recuperación más potente que existe, y ninguna otra la sustituye.',
      'Come normal: en los días de descanso el cuerpo está reconstruyendo y necesita material.',
      'Si algo molesta, hoy es el día de estirar suave, rodar el gemelo y revisarlo con calma.',
    ],
    porque: 'Saltarse los descansos es la vía más corta y más común a la lesión por sobrecarga.',
    ojo: 'La tentación de "recuperar" un entrenamiento perdido en un día de descanso es exactamente lo que no hay que hacer. Lo perdido, perdido.',
  },

  // ── Contexto de bloque ──────────────────────────────────────────────────
  {
    id: 'fuerza',
    titulo: 'La sesión de fuerza',
    cuando: s => !!s.fuerza,
    que: `Entre 30 y 35 minutos de fuerza, DESPUÉS de correr. Los ejercicios, series y cargas están más abajo en esta misma pantalla, con el peso que usaste la última vez.`,
    pasos: [
      'Primero correr, luego fuerza. Al revés llegas al rodaje con la pierna ya fatigada y pierde calidad.',
      'Técnica antes que peso. Sube la carga solo cuando completes todas las repeticiones limpias.',
      'Anota kilos y repeticiones al terminar cada ejercicio: sin ese registro no hay progresión, solo repetición.',
    ],
    porque: 'La fuerza es lo que protege rodilla, cadera y tendón cuando el volumen sube, y lo que sostiene la técnica en los kilómetros finales.',
    ojo: 'En semana de descarga o de carrera, la fuerza va ligera: mismo movimiento, menos carga.',
  },
  {
    id: 'carbos',
    titulo: 'Carga de carbohidratos',
    cuando: s => /carbohidrat/i.test(s.desc || ''),
    que: `Los tres días previos se sube el carbohidrato para llenar los depósitos de glucógeno. No es comer más: es cambiar la proporción del plato.`,
    pasos: [
      'Más arroz, pasta, papa, pan, fruta y tortilla. Menos grasa, menos fibra, menos verdura cruda de la costumbre.',
      'La cantidad total de comida es parecida — lo que cambia es de dónde vienen las calorías.',
      'Nada nuevo ni pesado, y evita el exceso de fibra la víspera: el estómago tiene que llegar tranquilo.',
      'Bebe agua a lo largo del día: el glucógeno se almacena con agua.',
    ],
    porque: 'Un depósito lleno son 30–45 minutos más de ritmo antes del muro.',
    ojo: 'La noche anterior no es la cena más grande de tu vida: es una cena normal, temprana y conocida.',
  },
  {
    id: 'carrera',
    titulo: 'Día de la carrera',
    cuando: s => s.type === 'carrera',
    que: `${PLAN.race.name} — salida ${PLAN.race.time} en ${PLAN.race.location}. Objetivo ${PLAN.race.objetivo}, límite ${PLAN.race.limite}, ritmo ${PLAN.race.ritmoMeta}. Corte: ${PLAN.race.corte}.`,
    pasos: [
      'Desayuno conocido 2–3 horas antes. Nada nuevo.',
      '5:1 desde el kilómetro 1. Sí, desde el primero, aunque te sientas capaz de más — sobre todo si te sientes capaz de más.',
      'Los primeros 5 km van a sentirse demasiado lentos. Está bien. La emoción de la salida es la principal causa de maratones arruinados.',
      'Gel cada 35–40 minutos desde el minuto 40, siempre con agua, siempre en un minuto de caminata.',
      'En cada avituallamiento, bebe. Aunque no tengas sed.',
      'Del kilómetro 32 en adelante se corre de a un intervalo por vez: solo los siguientes cinco minutos, nada más.',
    ],
    porque: 'Todo lo demás ya está hecho. Hoy solo hay que ejecutar el plan que llevas 18 semanas ensayando.',
    ojo: 'El único error irreversible es salir rápido. Todos los demás se pueden corregir en el camino.',
  },
];

/* Orden de lectura: lo que DEFINE el día primero, el contexto después. En un
   simulacro de 32 km aplican cinco guías; la que hay que leer es la del
   simulacro, no la del rodaje fácil. Se declara aparte del array para poder
   agrupar las guías arriba por tema sin que el agrupamiento decida el orden. */
const _PRIO = [
  'carrera', 'simulacro', 'rectas', 'progresivo', 'tempo', 'intervalos',
  'cuatrocientos', 'ritmo-maraton', 'cinco-uno', 'largo', 'geles',
  'facil', 'cruzado', 'descanso', 'fuerza', 'carbos',
];

/* Devuelve las guías que aplican a una sesión, máximo 5 y por prioridad. */
function guiaDe(s) {
  if (!s) return [];
  const out = [];
  for (const g of GUIA) {
    // Una guía con un `cuando` roto no debe tumbar la pantalla entera.
    try { if (g.cuando(s)) out.push(g); } catch (e) { /* se ignora */ }
  }
  const p = g => { const i = _PRIO.indexOf(g.id); return i === -1 ? _PRIO.length : i; };
  return out.sort((a, b) => p(a) - p(b)).slice(0, 5);
}
