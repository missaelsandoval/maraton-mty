/* Maratón MTY — seguimiento del plan.
   Sin dependencias. Los datos viven en localStorage de este dispositivo. */
(function () {
  'use strict';

  const LOG_KEY = 'mmty-log-v1';
  const SALUD_KEY = 'mmty-salud-v1';
  const FZA_KEY = 'mmty-fuerza-v1';

  // Regla de alto del plan: FC en reposo 7+ ppm arriba de la base, 3 días
  // seguidos = no estás absorbiendo la carga.
  const RHR_BASE_DEFAULT = 69;
  const RHR_DELTA = 7;
  const RHR_DIAS = 3;

  const TIPO = {
    descanso: { label: 'Descanso',       color: 'var(--ink-muted)' },
    facil:    { label: 'Rodaje fácil',   color: 'var(--series-1)' },
    calidad:  { label: 'Calidad',        color: 'var(--warning)' },
    largo:    { label: 'Tirada larga',   color: 'var(--good)' },
    cruzado:  { label: 'Cruzado + fuerza', color: 'var(--ink-muted)' },
    carrera:  { label: 'CARRERA',        color: 'var(--race)' },
  };

  const RPE = ['', 'muy suave', 'suave', 'cómodo', 'ligero', 'normal',
               'algo duro', 'duro', 'muy duro', 'al límite', 'máximo'];

  /* La rutina de fuerza: "Ganancia de fuerza" de Runna (15-ago-2026), más los
     cinco ejercicios de las viejas A/B cuyo estímulo Runna no cubre con nada
     — marcados `extra: true`.

     Qué se añadió y por qué. Runna no trae NADA de gemelo, y el sóleo es el
     punto débil identificado: vuelven las dos elevaciones de talón, sentada
     (sóleo, rodilla flexionada) y de pie (gastrocnemio, rodilla extendida).
     Tampoco trae bisagra de cadera con carga — el isométrico de isquiotibiales
     es sostén, no fuerza — así que vuelve el peso muerto rumano. Y no trae
     antirrotación ni antiextensión: vuelven Pallof press y Bird-dog.

     La sentadilla goblet volvió el 15-ago-2026, después de haberla dejado
     fuera un rato: Runna sí trae el patrón de sentadilla, pero solo con peso
     corporal, así que la carga bilateral de cuádriceps no la cubría nadie.

     Qué NO se añadió, porque Runna ya lo cubre con otro nombre: zancada
     búlgara y step-up (los cubre estocada caminando + zancada y press),
     plancha frontal (la cubre la caminata con flexiones + plancha lateral) y
     puente de glúteo a 1 pierna (lo cubre el isométrico de isquiotibiales).

     Los que regresan conservan su id original (`sg`, `pmr`, `tal_s`, `tal_p`,
     `pp`, `bd`) a propósito: así el historial de cargas ya registrado se
     reconecta solo, en vez de quedar huérfano.

     Sale la MISMA rutina los 34 días de fuerza, porque de Runna solo se
     capturó una sesión. plan.js sigue marcando los días como "A" y "B": esa
     marca se respeta y ambas resuelven aquí, así el plan no se toca.

     `vid` apunta al tutorial de Runna: video más claves de técnica escritas,
     en páginas públicas que no piden cuenta. El orden es el de ejecución. */
  const FUERZA = {
    R: {
      titulo: 'Fuerza · Runna, completada',
      meta: '45–55 min · mancuerna',
      ejercicios: [
        { id: 'r_sent', n: 'Sentadilla con peso corporal', obj: '2 × 30 s', sinPeso: true,
          nota: 'calentamiento · 2 series, 1 min de descanso',
          vid: 'https://support.runna.com/en/articles/6376116-bodyweight-squat-exercise-tutorial' },
        { id: 'r_camf', n: 'Caminata con flexiones desplazadas', obj: '2 × 30 s', sinPeso: true,
          nota: 'calentamiento',
          vid: 'https://support.runna.com/en/articles/6321878-travelling-press-up-walk-out-exercise-tutorial' },
        { id: 'r_estc', n: 'Estocada caminando', obj: '2 × 30 s', sinPeso: true,
          nota: 'calentamiento',
          vid: 'https://support.runna.com/en/articles/6321369-walking-lunge-exercise-tutorial' },
        { id: 'r_toqd', n: 'Toque diagonal con la punta del pie', obj: '2 × 30 s por lado', sinPeso: true,
          nota: 'calentamiento',
          vid: 'https://support.runna.com/en/articles/6376752-diagonal-toe-tap-exercise-tutorial' },
        { id: 'sg',    n: 'Sentadilla goblet', obj: '3 × 10', extra: true,
          nota: 'Runna solo trae la sentadilla sin carga',
          vid: 'https://support.runna.com/en/articles/6376223-goblet-squat-exercise-tutorial-for-runners' },
        { id: 'pmr',   n: 'Peso muerto rumano', obj: '3 × 8', extra: true,
          nota: 'Runna no trae bisagra de cadera con carga',
          vid: 'https://support.runna.com/en/articles/6331984-straight-leg-deadlift-exercise-tutorial' },
        { id: 'r_isqi', n: 'Flexiones isométricas de isquiotibiales a 1 pierna', obj: '3 × 20 s por lado', sinPeso: true,
          nota: '3 series, 2 min de descanso',
          vid: 'https://support.runna.com/en/articles/7946130-single-leg-isometric-hamstring-hold-exercise-tutorial' },
        { id: 'r_zanp', n: 'Zancada y press', obj: '3 series',
          nota: 'con mancuerna',
          vid: 'https://support.runna.com/en/articles/6398160-lunge-and-press-exercise-tutorial' },
        { id: 'tal_s', n: 'Elevación de talón sentado', obj: '3 × 15', extra: true,
          nota: 'rodilla flexionada → sóleo. Tu punto débil; Runna no lo toca',
          vid: 'https://support.runna.com/en/articles/6364682-seated-calf-raise-exercise-tutorial' },
        { id: 'tal_p', n: 'Elevación de talón de pie', obj: '3 × 15', extra: true,
          nota: 'rodilla extendida → gastrocnemio',
          vid: 'https://support.runna.com/en/articles/6395288-double-leg-calf-raise-exercise-tutorial' },
        { id: 'pp',    n: 'Pallof press', obj: '3 × 10 por lado', extra: true,
          nota: 'antirrotación; Runna no trae nada equivalente' },
        { id: 'r_plat', n: 'Plancha lateral', obj: '2 series por lado', sinPeso: true,
          vid: 'https://support.runna.com/en/articles/6363965-side-plank-exercise-tutorial' },
        { id: 'bd',    n: 'Bird-dog', obj: '2 × 10 por lado', sinPeso: true, extra: true,
          nota: 'antiextensión y estabilidad' },
      ],
    },
  };

  /* plan.js marca los días como "A" o "B"; hoy las dos son la misma rutina.
     Este indirecto es el que evita tener que reescribir plan.js —  que además
     trae cambios de la otra máquina sin commitear. */
  function rutinaFuerza(clave) { return clave ? FUERZA.R : null; }

  /* Los de A y B que NO regresaron, porque Runna ya cubre su estímulo con
     otro nombre. Lo ya registrado con estos ids sigue en localStorage: sin
     este mapa saldría del export sin nombre, o sea se perdería en silencio.
     Los que sí regresaron conservan su id y no necesitan estar aquí. */
  const EJ_RETIRADOS = {
    zb:   'Zancada búlgara',            pg1: 'Puente de glúteo a 1 pierna',
    plat: 'Plancha lateral (3 × 30 s)', su:  'Step-up con mancuernas',
    pfr:  'Plancha frontal',
  };
  function nombreEjercicio(id) {
    for (const k of Object.keys(FUERZA)) {
      const ej = FUERZA[k].ejercicios.find(x => x.id === id);
      if (ej) return ej.n;
    }
    return EJ_RETIRADOS[id] || null;
  }

  // ── Estado ────────────────────────────────────────────────
  let log = load();
  let salud = loadSalud();
  let fuerza = loadFza();
  let view = 'hoy';
  let weekIdx = 0;
  let editingId = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }
    catch (e) { toast('No se pudo guardar. ¿Almacenamiento lleno?'); }
  }
  function loadSalud() {
    try { return JSON.parse(localStorage.getItem(SALUD_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveSalud() {
    try { localStorage.setItem(SALUD_KEY, JSON.stringify(salud)); }
    catch (e) { toast('No se pudo guardar Salud.'); }
  }
  function loadFza() {
    try { return JSON.parse(localStorage.getItem(FZA_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveFza() {
    try { localStorage.setItem(FZA_KEY, JSON.stringify(fuerza)); }
    catch (e) { toast('No se pudo guardar la fuerza.'); }
  }

  /* Último peso registrado de un ejercicio, mirando hacia atrás desde una
     fecha. Es lo que convierte el registro en progresión: sin el dato previo
     enfrente, "subir carga cada 2 semanas" no se puede ejecutar. */
  function ultimaCarga(ejId, antesDe) {
    const fechas = Object.keys(fuerza).filter(f => !antesDe || f < antesDe).sort();
    for (let i = fechas.length - 1; i >= 0; i--) {
      const s = fuerza[fechas[i]];
      if (s && s[ejId] && Number.isFinite(s[ejId].kg)) {
        return { kg: s[ejId].kg, reps: s[ejId].reps, fecha: fechas[i] };
      }
    }
    return null;
  }
  function fuerzaDe(fecha) { return fuerza[fecha] || {}; }
  function tieneFuerza(fecha) {
    const s = fuerza[fecha];
    return !!(s && Object.keys(s).length);
  }

  // ── Importación desde Salud (vía Atajos) ──────────────────
  /* Formato de líneas, no JSON: Atajos lo produce con un bloque de texto
     simple, y así puedes leerlo y corregirlo a ojo.
       FCR   <fecha> <ppm>
       PESO  <fecha> <kg>
       SUENO <fecha> <minutos>
       ENT   <fecha> <km> <minutos> [fcMedia]
     Las líneas que no encajan se ignoran en vez de tumbar la importación. */
  function parseSalud(texto) {
    const res = { dias: 0, entrenos: 0, ignoradas: 0, fechas: [] };
    const nuevoS = {}, nuevoE = [];
    String(texto).split(/[\r\n]+/).forEach(raw => {
      const l = raw.trim();
      if (!l) return;
      // Ojo: NO separar por coma — "109,2" es un decimal, no dos campos.
      const p = l.split(/[\s;]+/);
      const tag = (p[0] || '').toUpperCase();
      const f = p[1] || '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) { if (tag) res.ignoradas++; return; }
      const num = i => { const v = parseFloat(String(p[i]).replace(',', '.')); return isFinite(v) ? v : null; };
      if (tag === 'FCR' || tag === 'PESO' || tag === 'SUENO' || tag === 'SUEÑO') {
        const v = num(2);
        if (v == null || v <= 0) { res.ignoradas++; return; }
        nuevoS[f] = nuevoS[f] || {};
        if (tag === 'FCR') nuevoS[f].fcReposo = Math.round(v);
        else if (tag === 'PESO') nuevoS[f].peso = Math.round(v * 10) / 10;
        // El sueño se captura a mano (el Atajo no lo trae: ver README), así
        // que llega en horas o en minutos según quien lo escriba. Una noche
        // nunca son 7 minutos ni 400 horas: el rango desambigua sin preguntar.
        else nuevoS[f].suenoMin = Math.round(v <= 24 ? v * 60 : v);
      } else if (tag === 'ENT') {
        const km = num(2), min = num(3), fc = num(4);
        if (km == null && min == null) { res.ignoradas++; return; }
        nuevoE.push({ fecha: f, km, min, fc });
      } else { res.ignoradas++; }
    });

    Object.keys(nuevoS).forEach(f => {
      salud[f] = Object.assign({}, salud[f], nuevoS[f]);
      res.dias++;
    });

    // Los entrenamientos se cruzan con la sesión del plan de ese día.
    nuevoE.forEach(e => {
      const s = sessionByDate(e.fecha);
      if (!s) { res.ignoradas++; return; }
      const prev = log[s.id] || {};
      log[s.id] = Object.assign({}, prev, {
        done: true,
        km: e.km != null ? e.km : (prev.km || 0),
        // Un decimal, no entero: los entrenamientos vienen en mm:ss y 40:30
        // redondeado a 41 min desplaza el ritmo 8 s/km — justo la precisión
        // que necesita la comparación contra el rango objetivo.
        timeMin: e.min != null ? Math.round(e.min * 10) / 10 : (prev.timeMin ?? null),
        fcMedia: e.fc != null ? Math.round(e.fc) : (prev.fcMedia ?? null),
        rpe: prev.rpe ?? 5,
        notes: prev.notes || '',
        fuente: 'Salud',
        loggedAt: new Date().toISOString(),
      });
      res.entrenos++;
      res.fechas.push(e.fecha);
    });

    if (res.dias) saveSalud();
    if (res.entrenos) save();
    return res;
  }

  // ── Ritmos: parseo, unidades y comparación real vs objetivo ──
  /* Las cadenas de plan.js vienen como "10:15–11:00/km · 3.4–3.6 mph" o
     "prom 8:47–9:15/km · 4.0–4.2 mph". De ahí sale el rango objetivo en
     segundos por km, y el km/h se calcula (no se guarda): una unidad menos
     que mantener sincronizada a mano. */
  function msSeg(txt) {                       // "10:15" -> 615
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(txt).trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  function segMs(seg) {                       // 615 -> "10:15"
    const s = Math.round(seg);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  function rangoObjetivo(pace) {
    if (!pace) return null;
    const m = /(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*\/km/.exec(pace);
    if (!m) return null;
    const a = msSeg(m[1]), b = msSeg(m[2]);
    if (a == null || b == null) return null;
    return { rapido: Math.min(a, b), lento: Math.max(a, b) };
  }
  function kmhDe(seg) { return 3600 / seg; }  // seg/km -> km/h
  function kmhTxt(pace) {
    const r = rangoObjetivo(pace);
    if (!r) return '';
    const lo = kmhDe(r.lento), hi = kmhDe(r.rapido);
    return `${lo.toFixed(1)}–${hi.toFixed(1)} km/h`;
  }
  /* La cadena completa que se muestra: min/km, mph y km/h.
     El km/h es el que usa la caminadora; tenerlo evita convertir de cabeza. */
  function paceCompleto(pace) {
    const k = kmhTxt(pace);
    return k ? `${pace} · ${k}` : pace;
  }
  function ritmoReal(e) {                     // seg/km a partir del registro
    if (!e || !e.km || !e.timeMin) return null;
    const km = Number(e.km), min = Number(e.timeMin);
    if (!(km > 0) || !(min > 0)) return null;
    return (min * 60) / km;
  }
  /* Veredicto real vs objetivo. El plan es explícito: pasarse cuenta como
     fallar igual que quedarse corto, y en zona fácil más lento es mejor. */
  function vsObjetivo(s, e) {
    const r = rangoObjetivo(s.pace), real = ritmoReal(e);
    if (!r || real == null) return null;
    if (real < r.rapido) {
      return { estado: 'rapido', delta: Math.round(r.rapido - real),
               txt: `${Math.round(r.rapido - real)} s/km más rápido que el objetivo` };
    }
    if (real > r.lento) {
      return { estado: 'lento', delta: Math.round(real - r.lento),
               txt: `${Math.round(real - r.lento)} s/km más lento que el objetivo` };
    }
    return { estado: 'dentro', delta: 0, txt: 'dentro de la zona' };
  }

  // ── Regla de FC en reposo ─────────────────────────────────
  function saludOrdenado() {
    return Object.keys(salud).sort().map(f => Object.assign({ fecha: f }, salud[f]));
  }
  /* Base adaptativa. Arranca en la referencia del plan (69) y a los 7 días
     pasa a la mediana de los últimos 28. Siete y no catorce porque al volver
     de un parón la FC en reposo está alta de forma sostenida —78 al cerrar la
     S1— y con base 69 la alerta se queda encendida: deja de significar algo.
     La mediana aguanta días sueltos altos sin desplazarse. */
  function rhrBase() {
    const v = saludOrdenado().map(d => d.fcReposo).filter(Number.isFinite).slice(-28);
    if (v.length < 7) return RHR_BASE_DEFAULT;
    const s = v.slice().sort((a, b) => a - b);
    return Math.round(s[Math.floor(s.length / 2)]);
  }
  /* Señal crónica, distinta de la aguda: que la base misma se haya instalado
     muy por encima de la referencia del plan no dispara la regla de 3 días,
     pero dice que el punto de partida cambió. */
  function rhrCronica() {
    const base = rhrBase();
    return base >= RHR_BASE_DEFAULT + 5 ? { base, ref: RHR_BASE_DEFAULT } : null;
  }
  function alertaRHR() {
    const base = rhrBase(), lim = base + RHR_DELTA;
    const dias = saludOrdenado().filter(d => Number.isFinite(d.fcReposo)).slice(-RHR_DIAS);
    if (dias.length < RHR_DIAS) return null;
    // Deben ser días consecutivos, no tres lecturas sueltas del mes.
    for (let i = 1; i < dias.length; i++) {
      if (daysBetween(dias[i - 1].fecha, dias[i].fecha) !== 1) return null;
    }
    if (!dias.every(d => d.fcReposo >= lim)) return null;
    return { base, lim, dias };
  }

  // ── Fechas (todo en local, sin UTC) ───────────────────────
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function parseISO(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function daysBetween(aISO, bISO) {
    return Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000);
  }
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function fmtCorto(iso) {
    const d = parseISO(iso);
    return `${d.getDate()} ${MESES[d.getMonth()]}`;
  }

  // ── Consultas sobre el plan ───────────────────────────────
  const ALL = PLAN.weeks.flatMap(w => w.sessions.map(s => ({ ...s, week: w })));

  function sessionByDate(iso) { return ALL.find(s => s.date === iso) || null; }
  function weekIndexForDate(iso) {
    const i = PLAN.weeks.findIndex(w => iso >= w.start && iso <= w.end);
    return i;
  }
  function actualKm(id) {
    const e = log[id];
    return e && e.done ? (Number(e.km) || 0) : 0;
  }
  function weekActual(w) { return w.sessions.reduce((t, s) => t + actualKm(s.id), 0); }
  function isDone(id) { return !!(log[id] && log[id].done); }

  function totals() {
    let done = 0, plan = 0, sessions = 0;
    ALL.forEach(s => {
      plan += s.km;
      if (isDone(s.id)) { done += actualKm(s.id); sessions++; }
    });
    return { done, plan, sessions };
  }

  // ── Render: HOY ───────────────────────────────────────────
  function renderHoy() {
    const t = todayISO();
    const s = sessionByDate(t);
    const el = document.getElementById('hoy-content');
    const race = PLAN.race.date;
    const dLeft = daysBetween(t, race);

    let html = '';

    // La única regla del plan que no puedes vigilar a ojo.
    const al = alertaRHR();
    if (al) {
      html += `<div class="alerta">
        <p class="alerta-t">Tu cuerpo pide un freno</p>
        <p class="alerta-b">Llevas ${RHR_DIAS} días seguidos con la frecuencia en reposo
        en <b>${al.dias.map(d => d.fcReposo).join(', ')} ppm</b>, contra tu base de ${al.base}.
        El plan marca parar cuando llega a ${al.lim} o más tres días seguidos: no estás absorbiendo la carga.</p>
        <p class="alerta-b">Cambia hoy por descanso o caminata suave. Si sigue mañana, escríbeme
        para ajustar la semana en vez de recuperar sesiones acumulándolas.</p>
      </div>`;
    }

    if (!s) {
      const antes = t < PLAN.startDate;
      html += `<div class="card">
        <p class="eyebrow">Hoy</p>
        <div class="hero-type">${antes ? 'Aún no arranca' : 'Fuera del plan'}</div>
        <p class="hero-desc">${antes
          ? `El plan comienza el <b>${fmtCorto(PLAN.startDate)}</b>. Mientras tanto, camina, duerme y llega entero al arranque.`
          : `Ya pasó la carrera. Toca recuperar: dos semanas suaves antes de volver a estructura.`}</p>
      </div>`;
    } else {
      const cfg = TIPO[s.type];
      const done = isDone(s.id);
      const e = log[s.id];
      const isRest = s.type === 'descanso' || s.type === 'cruzado';

      html += `<div class="card">
        <p class="eyebrow">Hoy · ${s.dow} ${fmtCorto(s.date)} · Semana ${s.week.num} de ${PLAN.weeks.length}</p>
        <div class="hero-type" style="color:${cfg.color}">${cfg.label}</div>
        ${s.km > 0 ? `<div class="hero-km">${fmtKm(s.km)}<small>km</small></div>` : ''}
        <p class="hero-desc">${esc(s.desc)}</p>
        ${s.pace ? `<div class="pace-box">
          <span class="pace-l">Ritmo objetivo</span>
          <span class="pace-v">${esc(paceCompleto(s.pace))}</span>
        </div>` : ''}
        ${s.fuerza ? `<div class="pace-box pace-alt">
          <span class="pace-l">Además hoy</span>
          <span class="pace-v">Fuerza ${s.fuerza} · 30–35 min, después de correr</span>
        </div>` : ''}
        ${s.week.num <= 9 && s.km > 0 ? `<p class="note note-warn">${esc(PLAN.calor)}</p>` : ''}
        <div style="margin-top:16px">
          ${done
            ? `<span class="pill is-done"><span class="pill-dot"></span>Registrado${e && e.km ? ` · ${fmtKm(e.km)} km` : ''}${e && e.timeMin ? ` · ${e.timeMin} min` : ''}</span>
               <button class="btn btn-ghost btn-block" style="margin-top:12px" data-log="${s.id}">Editar registro</button>`
            : `<button class="btn btn-primary btn-block" data-log="${s.id}">
                 ${isRest ? 'Marcar como cumplido' : 'Registrar sesión'}
               </button>`}
        </div>
      </div>`;
    }

    const T = totals();
    const wI = Math.max(0, weekIndexForDate(t));
    const w = PLAN.weeks[wI];
    html += `<div class="stat-row">
      <div class="stat"><div class="stat-v">${dLeft > 0 ? dLeft : 0}</div><div class="stat-l">días para la carrera</div></div>
      <div class="stat"><div class="stat-v">${fmtKm(weekActual(w))}<span style="font-size:13px;color:var(--ink-muted)">/${w.targetKm}</span></div><div class="stat-l">km esta semana</div></div>
      <div class="stat"><div class="stat-v">${T.sessions}</div><div class="stat-l">${T.sessions === 1 ? 'sesión hecha' : 'sesiones hechas'}</div></div>
    </div>`;

    // Próximas 3 sesiones con km
    const next = ALL.filter(x => x.date > t && x.km > 0).slice(0, 3);
    if (next.length) {
      html += `<h2 class="section-h">Lo que viene</h2><div class="card card-flat">`;
      next.forEach(n => { html += dayRow(n, false); });
      html += `</div>`;
    }

    el.innerHTML = html;
  }

  // ── Render: SEMANA ────────────────────────────────────────
  function renderSemana() {
    const w = PLAN.weeks[weekIdx];
    const t = todayISO();
    document.getElementById('wk-label').innerHTML =
      `Semana ${w.num} · ${w.phaseLabel}${w.deload ? ' (descarga)' : ''}
       <span>${fmtCorto(w.start)} – ${fmtCorto(w.end)} · objetivo ${w.targetKm} km</span>`;
    document.getElementById('wk-prev').disabled = weekIdx === 0;
    document.getElementById('wk-next').disabled = weekIdx === PLAN.weeks.length - 1;

    const real = weekActual(w);
    const pct = w.targetKm ? Math.min(100, (real / w.targetKm) * 100) : 0;

    let html = `<div class="card">
      <div class="wk-top">
        <span class="wk-phase">Volumen de la semana</span>
        <span class="wk-km">${fmtKm(real)} de ${w.targetKm} km</span>
      </div>
      <div class="wk-track"><div class="wk-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="card card-flat">`;
    w.sessions.forEach(s => { html += dayRow({ ...s, week: w }, s.date === t); });
    html += `</div>`;
    document.getElementById('semana-content').innerHTML = html;
  }

  function dayRow(s, isToday) {
    const cfg = TIPO[s.type];
    const done = isDone(s.id);
    const e = log[s.id];
    const rest = s.type === 'descanso' || s.type === 'cruzado';
    const d = parseISO(s.date);
    // Real cuando existe, plan cuando no — y se marca cuál es cuál.
    const kmTxt = done && e && e.km
      ? `${fmtKm(e.km)} km`
      : (s.km > 0 ? `${fmtKm(s.km)} km` : '—');
    const planTxt = done && e && e.km && Math.abs(e.km - s.km) > 0.05
      ? `<span class="day-plan">plan ${fmtKm(s.km)}</span>` : '';
    const v = done ? vsObjetivo(s, e) : null;
    const real = done ? ritmoReal(e) : null;
    const fz = tieneFuerza(s.date);
    return `<button class="day ${isToday ? 'is-today' : ''} ${rest ? 'is-rest' : ''}" data-log="${s.id}">
      <span class="day-bar" style="background:${cfg.color}"></span>
      <span class="day-date">
        <span class="day-dow">${s.dow.slice(0, 3)}</span>
        <span class="day-num">${d.getDate()}</span>
      </span>
      <span class="day-body">
        <span class="day-type">${cfg.label}${s.fuerza
          ? `<span class="chip-f ${fz ? 'is-ok' : ''}">Fuerza ${s.fuerza}${fz ? ' ✓' : ''}</span>` : ''}</span>
        <span class="day-desc">${esc(s.desc)}</span>
        ${s.pace ? `<span class="day-pace">${esc(paceCompleto(s.pace))}</span>` : ''}
        ${real != null ? `<span class="day-vs ${v ? 'es-' + v.estado : ''}">
          ${segMs(real)}/km${e.fcMedia ? ` · ${e.fcMedia} ppm` : ''}${v ? ` — ${esc(v.txt)}` : ''}
        </span>` : ''}
      </span>
      <span class="day-km">${kmTxt}${planTxt}</span>
      <span class="day-check ${done ? 'is-done' : ''}">✓</span>
    </button>`;
  }

  // ── Render: PLAN ──────────────────────────────────────────
  function renderPlan() {
    const T = totals();
    const t = todayISO();
    const curW = weekIndexForDate(t);
    const max = Math.max(...PLAN.weeks.map(w => w.targetKm));

    // Gráfica de barras: objetivo (track) vs real (relleno). Un solo eje.
    const BW = 14, GAP = 4, H = 120, PADB = 18;
    const W = PLAN.weeks.length * (BW + GAP) - GAP;
    let bars = '';
    PLAN.weeks.forEach((w, i) => {
      const x = i * (BW + GAP);
      const hT = (w.targetKm / max) * H;
      const real = Math.min(weekActual(w), max);
      const hR = (real / max) * H;
      bars += `<rect x="${x}" y="${H - hT}" width="${BW}" height="${hT}" rx="4" fill="var(--grid)"/>`;
      if (hR > 0) bars += `<rect x="${x}" y="${H - hR}" width="${BW}" height="${hR}" rx="4" fill="var(--series-1)"/>`;
      if (i === curW) bars += `<circle cx="${x + BW / 2}" cy="${H + 8}" r="2.5" fill="var(--series-1)"/>`;
      if (i % 3 === 0 || i === PLAN.weeks.length - 1) {
        bars += `<text x="${x + BW / 2}" y="${H + PADB}" text-anchor="middle"
                   font-size="9" fill="var(--ink-muted)" font-family="var(--font)">${w.num}</text>`;
      }
    });

    let html = `<div class="stat-row">
      <div class="stat"><div class="stat-v">${fmtKm(T.done)}</div><div class="stat-l">km acumulados</div></div>
      <div class="stat"><div class="stat-v">${fmtKm(T.plan)}</div><div class="stat-l">km del plan</div></div>
      <div class="stat"><div class="stat-v">${T.plan ? Math.round(T.done / T.plan * 100) : 0}%</div><div class="stat-l">completado</div></div>
    </div>

    <div class="card">
      <p class="eyebrow">Volumen por semana (km)</p>
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch" style="background:var(--grid)"></span>Objetivo</span>
        <span class="legend-item"><span class="legend-swatch" style="background:var(--series-1)"></span>Real</span>
      </div>
      <div class="chart-wrap">
        <svg class="chart" viewBox="0 0 ${W} ${H + 24}" width="${W}" height="${H + 24}" role="img"
             aria-label="Volumen semanal objetivo contra real, semanas 1 a ${PLAN.weeks.length}">
          ${bars}
        </svg>
      </div>
      <p class="note">Las bajadas son semanas de descarga: están puestas a propósito para que el cuerpo asimile la carga.</p>
    </div>

    <h2 class="section-h">Las ${PLAN.weeks.length} semanas</h2>
    <div class="card card-flat">`;

    PLAN.weeks.forEach((w, i) => {
      const real = weekActual(w);
      const pct = w.targetKm ? Math.min(100, real / w.targetKm * 100) : 0;
      html += `<div class="wk-row ${i === curW ? 'is-current' : ''}">
        <span class="wk-n">${w.num}</span>
        <span class="wk-mid">
          <span class="wk-top">
            <span class="wk-phase">${w.phaseLabel}
              ${w.deload ? '<span class="tag">descarga</span>' : ''}
              ${i === PLAN.weeks.length - 1 ? '<span class="tag" style="color:var(--race)">carrera</span>' : ''}
            </span>
            <span class="wk-km">${fmtKm(real)}/${w.targetKm} km</span>
          </span>
          <span class="wk-track"><span class="wk-fill" style="width:${pct}%"></span></span>
          <span class="wk-km" style="font-size:11px;color:var(--ink-muted)">
            ${fmtCorto(w.start)} – ${fmtCorto(w.end)} · larga ${fmtKm(w.longKm)} km
          </span>
        </span>
      </div>`;
    });
    html += `</div>`;

    html += cuerpoCard();
    html += guiaFuerzaCard();

    html += `<h2 class="section-h">Tus ritmos</h2>
    <div class="card">
      <div class="zonas">
        ${PLAN.zonas.map(z => `<div class="zona">
          <span class="zona-n">${esc(z.zona)}</span>
          <span class="zona-p">${esc(z.minkm)}<small>/km</small></span>
          <span class="zona-k">${esc(z.kmh)} km/h${z.mph ? ` · ${esc(z.mph)} mph` : ''}</span>
          <span class="zona-s">${esc(z.sensacion)}</span>
        </div>`).join('')}
      </div>
      <p class="note">${esc(PLAN.calor)}</p>
    </div>

    <div class="card">
      <p class="eyebrow">Estrategia</p>
      <p class="hero-desc" style="font-size:15px">${esc(PLAN.estrategia)}</p>
    </div>

    <div class="card">
      <p class="eyebrow">Carrera objetivo</p>
      <div style="font-size:17px;font-weight:650;margin-bottom:4px">${esc(PLAN.race.name)}</div>
      <p class="note" style="margin-top:0">Domingo ${fmtCorto(PLAN.race.date)} de 2026 · salida ${PLAN.race.time} · ${esc(PLAN.race.location)}</p>
      <div class="stat-row" style="margin-top:14px">
        <div class="stat"><div class="stat-v" style="font-size:19px">${esc(PLAN.race.objetivo)}</div><div class="stat-l">objetivo</div></div>
        <div class="stat"><div class="stat-v" style="font-size:19px">${esc(PLAN.race.ritmoMeta.split(' · ')[0])}</div><div class="stat-l">ritmo meta</div></div>
        <div class="stat"><div class="stat-v" style="font-size:19px">${esc(PLAN.race.limite)}</div><div class="stat-l">límite oficial</div></div>
      </div>
      <p class="note note-warn">${esc(PLAN.race.corte)} — ese corte es el problema real del plan.</p>
    </div>`;

    document.getElementById('plan-content').innerHTML = html;
  }

  // ── Render: guía de ejercicios ────────────────────────────
  /* Catálogo de consulta rápida. Vive en Plan y no en la hoja de captura
     porque ahí estorbaría: en la hoja va el enlace suelto de cada ejercicio,
     que es lo que se necesita a media serie. Aquí se lee completo, antes o
     después de entrenar. */
  function guiaFuerzaCard() {
    const linea = ej => `<li class="gf-ej">
      <span class="gf-n">${esc(ej.n)}${ej.extra ? '<span class="gf-tag">añadido</span>' : ''}
        ${ej.nota ? `<span class="gf-nota">${esc(ej.nota)}</span>` : ''}</span>
      <span class="gf-o">${esc(ej.obj)}</span>
      ${ej.vid ? `<a class="fza-vid" href="${esc(ej.vid)}" target="_blank" rel="noopener">técnica</a>`
               : '<span class="gf-sin">sin video</span>'}
    </li>`;

    const r = FUERZA.R;
    const dias = PLAN.weeks.reduce((n, w) => n + w.sessions.filter(s => s.fuerza).length, 0);
    return `<h2 class="section-h">Guía de ejercicios</h2>
    <div class="card">
      <p class="eyebrow">${esc(r.titulo)}</p>
      <p class="note" style="margin-top:0">${esc(r.meta)}. Cada enlace abre el tutorial de
      Runna: video y las claves de técnica escritas. Son páginas públicas, no piden cuenta.</p>
      <ul class="gf-lista" style="margin-top:12px">${r.ejercicios.map(linea).join('')}</ul>
      <p class="note">Es la misma rutina en los ${dias} días de fuerza del plan: de Runna se
      capturó una sola sesión. Si sacas más de su plan, se agregan y se reparten.</p>
      <p class="note">Los marcados <b>añadido</b> no vienen de Runna: son de tus rutinas A y B
      y volvieron porque Runna no cubre ese estímulo con nada. Los demás de A y B se quedaron
      fuera porque sí están, con otro nombre — la estocada caminando hace lo de la zancada
      búlgara, y el isométrico de isquiotibiales lo del puente de glúteo.</p>
      <p class="note note-warn">La sesión quedó en 45–55 min, casi el doble que la de Runna
      sola. Si un día no te alcanza el tiempo, recorta el calentamiento antes que la carga:
      lo que sostiene el plan son las elevaciones de talón, el peso muerto y la sentadilla.</p>
    </div>`;
  }

  // ── Render: tarjeta "Tu cuerpo" ───────────────────────────
  /* Sparkline sobre un solo eje, escalado a min/max de la propia serie.
     No comparte escala con las otras: son unidades distintas. */
  function spark(vals, color, ref) {
    const n = vals.length;
    if (n < 2) return '';
    const W = 240, H = 34;
    const min = Math.min(...vals, ...(ref != null ? [ref] : []));
    const max = Math.max(...vals, ...(ref != null ? [ref] : []));
    const span = (max - min) || 1;
    const x = i => (i / (n - 1)) * W;
    const y = v => H - ((v - min) / span) * H;
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const linRef = ref != null
      ? `<line x1="0" y1="${y(ref).toFixed(1)}" x2="${W}" y2="${y(ref).toFixed(1)}"
              stroke="var(--ink-muted)" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>` : '';
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${linRef}<path d="${d}" fill="none" stroke="${color}" stroke-width="2"
        stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(n - 1).toFixed(1)}" cy="${y(vals[n - 1]).toFixed(1)}" r="2.8" fill="${color}"/>
    </svg>`;
  }

  function fmtSueno(min) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return `${h} h ${String(m).padStart(2, '0')}`;
  }

  function cuerpoCard() {
    const d = saludOrdenado();
    if (!d.length) {
      // Ojo: la fuerza se dibuja aparte y no depende de que haya datos de
      // Salud. Sin este append, capturar cargas no mostraba nada.
      return `<h2 class="section-h">Tu cuerpo</h2>
      <div class="card">
        <p class="note" style="margin:0">Todavía no hay datos de Salud. En la pestaña
        <b>Exportar</b> está el botón para traerlos del iPhone con un Atajo:
        frecuencia en reposo, peso y sueño.</p>
      </div>` + fuerzaCard();
    }
    const serie = k => d.filter(x => Number.isFinite(x[k])).slice(-30);
    const fcr = serie('fcReposo'), pes = serie('peso'), sue = serie('suenoMin');
    const base = rhrBase();
    const cron = rhrCronica();
    const ult = a => a.length ? a[a.length - 1] : null;

    const fila = (titulo, arr, key, color, valTxt, sub, ref) => {
      if (!arr.length) return '';
      const u = ult(arr);
      return `<div class="cuerpo-f">
        <div class="cuerpo-h">
          <span class="cuerpo-t">${titulo}</span>
          <span class="cuerpo-v" style="color:${color}">${valTxt(u[key])}</span>
        </div>
        ${spark(arr.map(x => x[key]), color, ref)}
        <span class="cuerpo-s">${sub} · ${arr.length} día${arr.length === 1 ? '' : 's'} · último ${fmtCorto(u.fecha)}</span>
      </div>`;
    };

    return `<h2 class="section-h">Tu cuerpo</h2>
    <div class="card">
      ${fila('Frecuencia en reposo', fcr, 'fcReposo', 'var(--series-1)',
             v => `${v} ppm`, `base ${base} · alto a partir de ${base + RHR_DELTA}`, base + RHR_DELTA)}
      ${fila('Peso', pes, 'peso', 'var(--good)',
             v => `${v.toFixed(1)} kg`, 'objetivo dic: 100–103 kg', 103)}
      ${fila('Sueño', sue, 'suenoMin', 'var(--warning)',
             v => fmtSueno(v), 'objetivo 7–8 h', 420)}
      <p class="note">La línea punteada es el umbral. La grasa visceral y la
      frecuencia en reposo se mueven antes que la báscula: no juzgues el plan por el peso.</p>
      ${cron ? `<p class="note note-warn">Tu base de frecuencia en reposo se
      instaló en <b>${cron.base} ppm</b>, contra los ${cron.ref} de referencia del plan.
      Eso no es fatiga de esta semana: es el punto de partida que dejó el parón.
      Se recupera con volumen fácil y sueño, no con sesiones duras.</p>` : ''}
    </div>` + fuerzaCard();
  }

  /* Historial de cargas. Sin esto, "subir carga cada 2 semanas" es una
     instrucción que no se puede ejecutar: no hay contra qué subir. */
  function fuerzaCard() {
    const fechas = Object.keys(fuerza).sort();
    if (!fechas.length) {
      return `<h2 class="section-h">Fuerza</h2>
      <div class="card"><p class="note" style="margin:0">Todavía no hay pesos
      registrados. Se capturan al abrir un día de fuerza. En esta rutina el único
      ejercicio con carga es <b>zancada y press</b>, así que la progresión se sigue
      por ahí. Arranca en la <b>semana 5</b>; para entonces conviene tener con
      qué comparar.</p></div>`;
    }
    const serieDe = id => fechas
      .filter(f => fuerza[f][id] && Number.isFinite(fuerza[f][id].kg))
      .map(f => ({ fecha: f, kg: fuerza[f][id].kg, reps: fuerza[f][id].reps }));

    const todos = [];
    const vistos = new Set();
    Object.keys(FUERZA).forEach(k => FUERZA[k].ejercicios.forEach(ej => {
      vistos.add(ej.id);
      if (ej.sinPeso) return;
      const serie = serieDe(ej.id);
      if (serie.length) todos.push({ ej, serie });
    }));

    /* Ejercicios que ya no están en la rutina pero de los que sí hay cargas
       registradas. Si no se listaran, cambiar de rutina se vería como si el
       historial se hubiera borrado — y no se borró, sigue en localStorage. */
    Object.keys(EJ_RETIRADOS).forEach(id => {
      if (vistos.has(id)) return;
      const serie = serieDe(id);
      if (serie.length) todos.push({ ej: { n: EJ_RETIRADOS[id], obj: 'rutina retirada' }, serie, viejo: true });
    });
    if (!todos.length) {
      return `<h2 class="section-h">Fuerza</h2>
      <div class="card"><p class="note" style="margin:0">Hay sesiones marcadas
      pero sin peso capturado.</p></div>`;
    }
    return `<h2 class="section-h">Fuerza</h2>
    <div class="card">
      ${todos.map(({ ej, serie, viejo }) => {
        const u = serie[serie.length - 1];
        const p = serie.length > 1 ? serie[serie.length - 2] : null;
        const d = p ? u.kg - p.kg : 0;
        return `<div class="cuerpo-f"${viejo ? ' style="opacity:.62"' : ''}>
          <div class="cuerpo-h">
            <span class="cuerpo-t">${esc(ej.n)}</span>
            <span class="cuerpo-v" style="color:var(--good)">${u.kg} kg${
              d ? `<span class="fza-delta ${d > 0 ? 'sube' : 'baja'}">${d > 0 ? '+' : ''}${d.toFixed(1)}</span>` : ''}</span>
          </div>
          ${serie.length > 1 ? spark(serie.map(x => x.kg), 'var(--good)', null) : ''}
          <span class="cuerpo-s">${pl(serie.length, 'sesión', 'sesiones')} ·
            última ${fmtCorto(u.fecha)}${u.reps ? ` · ${u.reps} reps` : ''} ·
            ${viejo ? 'de una rutina que ya no está en el plan' : `objetivo ${esc(ej.obj)}`}</span>
        </div>`;
      }).join('')}
      <p class="note">S1–S4 es técnica y carga ligera. <b>La progresión empieza
      en S5</b>: subir carga cada 2 semanas, con la última repetición exigente
      pero limpia. De S11 a S16 se mantiene carga y se baja a 2 series.</p>
    </div>`;
  }

  // ── Render: EXPORTAR ──────────────────────────────────────
  function markdownRows() {
    const rows = ALL
      .filter(s => isDone(s.id))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => {
        const e = log[s.id];
        const km = e.km ? `${fmtKm(e.km)} km` : '';
        const ev = s.type === 'carrera'
          ? `Maratón Monterrey — ${km}`
          : `Entrenamiento: ${TIPO[s.type].label}${km ? ' ' + km : ''}`;
        const partes = [];
        if (e.timeMin) partes.push(`${e.timeMin} min`);
        const r = ritmoReal(e);
        if (r != null) {
          const v = vsObjetivo(s, e);
          partes.push(`${segMs(r)}/km${v && v.estado !== 'dentro' ? ` (${v.txt})` : ''}`);
        }
        if (e.fcMedia) partes.push(`FC ${e.fcMedia} ppm`);
        const d = salud[s.date];
        if (d && Number.isFinite(d.fcReposo)) partes.push(`FC reposo ${d.fcReposo}`);
        if (e.rpe) partes.push(`sensación ${e.rpe}/10`);
        const fz = fuerza[s.date];
        if (fz) {
          const det = Object.keys(fz).map(id => {
            const n = nombreEjercicio(id);
            const v = fz[id];
            return n && Number.isFinite(v.kg) ? `${n} ${v.kg} kg${v.reps ? `×${v.reps}` : ''}` : null;
          }).filter(Boolean);
          if (det.length) partes.push(`Fuerza: ${det.join(', ')}`);
        }
        if (e.notes) partes.push(e.notes.replace(/\|/g, '/').replace(/\s+/g, ' ').trim());
        return `| ${s.date} (${s.dow}) | ${ev} | ${partes.join(' · ') || '—'} |`;
      });
    return rows;
  }

  function renderExportar() {
    const rows = markdownRows();
    const T = totals();
    const md = rows.length ? rows.join('\n') : '(todavía no hay sesiones registradas)';

    document.getElementById('exportar-content').innerHTML = `
      <div class="card">
        <p class="eyebrow">Filas para registro-salud.md</p>
        <p class="note" style="margin:0 0 12px">
          ${pl(rows.length, 'sesión registrada', 'sesiones registradas')} ·
          ${fmtKm(T.done)} km. Copia y pégalas en Claude Code para que actualice la bitácora.
        </p>
        <pre class="code" id="md-out">${esc(md)}</pre>
        <div class="stack">
          <button class="btn btn-primary btn-block" id="btn-copy">Copiar filas</button>
          <button class="btn btn-ghost btn-block" id="btn-share">Compartir…</button>
        </div>
      </div>

      <div class="card">
        <p class="eyebrow">Traer de Salud</p>
        <p class="note" style="margin:0 0 12px">
          Corre el Atajo <b>“Salud → Maratón”</b> en el iPhone (deja el texto en el
          portapapeles) y toca el botón. Trae frecuencia en reposo y peso del
          Apple Watch. Los entrenamientos y el sueño se registran aquí a mano:
          Atajos no sabe leerlos bien.
        </p>
        <div class="stack">
          <button class="btn btn-primary btn-block" id="btn-salud">Importar de Salud</button>
          <button class="btn btn-ghost btn-block" id="btn-salud-man">Pegar a mano…</button>
        </div>
        <div id="salud-manual" hidden style="margin-top:12px">
          <textarea id="salud-txt" class="ta" rows="6" placeholder="FCR 2026-08-04 69&#10;PESO 2026-08-04 109.2&#10;SUENO 2026-08-04 380&#10;ENT 2026-08-04 3.2 36 142"></textarea>
          <button class="btn btn-primary btn-block" style="margin-top:8px" id="btn-salud-proc">Procesar</button>
        </div>
        <p class="note" id="salud-estado" style="margin:12px 0 0">
          ${Object.keys(salud).length
            ? `${Object.keys(salud).length} día${Object.keys(salud).length === 1 ? '' : 's'} de datos guardados.`
            : 'Sin datos de Salud todavía.'}
        </p>
      </div>

      <div class="card">
        <p class="eyebrow">Respaldo</p>
        <p class="note" style="margin:0 0 12px">
          Los datos viven solo en este iPhone. Si borras los datos de Safari o cambias de teléfono, se pierden.
          Descarga un respaldo de vez en cuando y guárdalo en Archivos u OneDrive.
        </p>
        <div class="stack">
          <button class="btn btn-ghost btn-block" id="btn-backup">Descargar respaldo (.json)</button>
          <button class="btn btn-ghost btn-block" id="btn-restore">Restaurar desde respaldo</button>
          <input type="file" id="file-restore" accept="application/json,.json" hidden>
        </div>
      </div>

      <div class="card">
        <p class="eyebrow">Zona de riesgo</p>
        <button class="btn btn-danger btn-block" id="btn-wipe">Borrar todos mis registros</button>
      </div>`;

    document.getElementById('btn-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(rows.join('\n')); toast('Filas copiadas'); }
      catch (e) { selectText(document.getElementById('md-out')); toast('Selecciona y copia'); }
    };
    document.getElementById('btn-share').onclick = async () => {
      const text = rows.join('\n');
      if (navigator.share) { try { await navigator.share({ title: 'Entrenamientos', text }); } catch (e) {} }
      else toast('Compartir no disponible en este navegador');
    };
    function aplicarSalud(txt) {
      if (!txt || !txt.trim()) { toast('No había nada que importar'); return; }
      const r = parseSalud(txt);
      if (!r.dias && !r.entrenos) {
        toast('No reconocí ninguna línea');
        return;
      }
      const p = [];
      if (r.dias) p.push(`${r.dias} día${r.dias === 1 ? '' : 's'}`);
      if (r.entrenos) p.push(`${r.entrenos} entrenamiento${r.entrenos === 1 ? '' : 's'}`);
      render();
      toast(`Importado: ${p.join(' y ')}${r.ignoradas ? ` · ${r.ignoradas} línea(s) ignorada(s)` : ''}`);
    }

    document.getElementById('btn-salud').onclick = async () => {
      try {
        const txt = await navigator.clipboard.readText();
        aplicarSalud(txt);
      } catch (e) {
        // iOS puede negar la lectura del portapapeles: se cae al modo manual.
        document.getElementById('salud-manual').hidden = false;
        document.getElementById('salud-txt').focus();
        toast('Pega el texto aquí abajo');
      }
    };
    document.getElementById('btn-salud-man').onclick = () => {
      const m = document.getElementById('salud-manual');
      m.hidden = !m.hidden;
      if (!m.hidden) document.getElementById('salud-txt').focus();
    };
    document.getElementById('btn-salud-proc').onclick = () =>
      aplicarSalud(document.getElementById('salud-txt').value);

    document.getElementById('btn-backup').onclick = () => {
      const blob = new Blob([JSON.stringify({ v: 3, exported: todayISO(), log, salud, fuerza }, null, 2)],
                           { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `maraton-mty-respaldo-${todayISO()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    document.getElementById('btn-restore').onclick = () =>
      document.getElementById('file-restore').click();
    document.getElementById('file-restore').onchange = (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          const incoming = data.log || data;
          if (typeof incoming !== 'object' || Array.isArray(incoming)) throw new Error('formato');
          log = Object.assign({}, log, incoming);
          save();
          // v2 en adelante el respaldo también trae los datos de Salud.
          if (data.salud && typeof data.salud === 'object' && !Array.isArray(data.salud)) {
            salud = Object.assign({}, salud, data.salud);
            saveSalud();
          }
          // v3 en adelante trae también las cargas de fuerza.
          if (data.fuerza && typeof data.fuerza === 'object' && !Array.isArray(data.fuerza)) {
            fuerza = Object.assign({}, fuerza, data.fuerza);
            saveFza();
          }
          render();
          toast('Respaldo restaurado');
        } catch (e) { toast('Archivo no válido'); }
      };
      r.readAsText(f);
      ev.target.value = '';
    };
    document.getElementById('btn-wipe').onclick = () => {
      if (!confirm('¿Borrar registros, datos de Salud y cargas de fuerza? Esto no se puede deshacer.')) return;
      log = {}; salud = {}; fuerza = {};
      save(); saveSalud(); saveFza(); render(); toast('Registros borrados');
    };
  }

  // ── Hoja de captura ───────────────────────────────────────
  const sheet = document.getElementById('sheet');
  const backdrop = document.getElementById('sheet-backdrop');

  function openSheet(id) {
    const s = ALL.find(x => x.id === id);
    if (!s) return;
    editingId = id;
    const e = log[id] || {};
    const rest = s.type === 'descanso' || s.type === 'cruzado';

    document.getElementById('sheet-title').textContent = TIPO[s.type].label;
    document.getElementById('sheet-sub').textContent =
      `${s.dow} ${fmtCorto(s.date)}${s.km > 0 ? ` · plan: ${fmtKm(s.km)} km` : ''}` +
      (s.pace ? ` · ${s.pace}` : '');
    const sd = document.getElementById('sheet-desc');
    sd.textContent = s.desc + (s.fuerza ? ` · Fuerza ${s.fuerza} después de correr.` : '');
    sd.hidden = false;
    document.getElementById('f-km').value = e.km != null ? e.km : (rest ? '' : s.km);
    document.getElementById('f-time').value = e.timeMin != null ? e.timeMin : '';
    document.getElementById('f-fc').value = e.fcMedia != null ? e.fcMedia : '';
    document.getElementById('f-rpe').value = e.rpe != null ? e.rpe : 5;
    document.getElementById('f-notes').value = e.notes || '';
    document.getElementById('sheet-delete').hidden = !isDone(id);
    syncRpe();

    // Los campos de distancia no aplican a descanso / cruzado
    document.querySelector('.field-row').style.display = rest ? 'none' : 'flex';

    sheetSesion = s;
    syncRitmo();
    pintarFuerza(s);

    backdrop.hidden = false; sheet.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    backdrop.hidden = true; sheet.hidden = true; editingId = null;
    document.body.style.overflow = '';
  }
  function syncRpe() {
    const v = Number(document.getElementById('f-rpe').value);
    document.getElementById('rpe-val').textContent = v;
    document.getElementById('rpe-word').textContent = RPE[v];
  }

  let sheetSesion = null;

  function syncRitmo() {
    const box = document.getElementById('ritmo-box');
    const s = sheetSesion;
    if (!s || !s.pace) { box.hidden = true; return; }
    const prov = {
      km: parseFloat(document.getElementById('f-km').value),
      timeMin: parseInt(document.getElementById('f-time').value, 10),
    };
    const real = ritmoReal(prov);
    if (real == null) {
      box.hidden = false;
      document.getElementById('ritmo-real').textContent = 'Ritmo: pon km y minutos';
      document.getElementById('ritmo-vs').textContent = '';
      document.getElementById('ritmo-vs').className = 'ritmo-vs';
      return;
    }
    const v = vsObjetivo(s, prov);
    box.hidden = false;
    document.getElementById('ritmo-real').textContent =
      `${segMs(real)}/km · ${kmhDe(real).toFixed(1)} km/h`;
    const el = document.getElementById('ritmo-vs');
    el.textContent = v ? v.txt : '';
    el.className = 'ritmo-vs' + (v ? ' es-' + v.estado : '');
  }

  function pintarFuerza(s) {
    const bloque = document.getElementById('fza-bloque');
    const rut = rutinaFuerza(s.fuerza);
    if (!rut) { bloque.hidden = true; return; }
    const hoy = fuerzaDe(s.date);
    document.getElementById('fza-titulo').textContent = rut.titulo;
    document.getElementById('fza-lista').innerHTML = rut.ejercicios.map(ej => {
      const y = hoy[ej.id] || {};
      const prev = ultimaCarga(ej.id, s.date);
      const ref = prev
        ? `última: ${prev.kg} kg${prev.reps ? ` × ${prev.reps}` : ''} · ${fmtCorto(prev.fecha)}`
        : 'sin registro previo';
      return `<div class="fza-ej">
        <div class="fza-h">
          <span class="fza-n">${esc(ej.n)}${ej.vid
            ? ` <a class="fza-vid" href="${esc(ej.vid)}" target="_blank" rel="noopener">técnica</a>` : ''}</span>
          <span class="fza-o">${esc(ej.obj)}</span>
        </div>
        ${ej.nota ? `<span class="fza-nota">${esc(ej.nota)}</span>` : ''}
        <div class="fza-in">
          ${ej.sinPeso
            ? `<label class="fza-c"><span>Series hechas</span>
                 <input type="number" inputmode="numeric" min="0" step="1"
                        data-fza="${ej.id}" data-campo="reps" value="${y.reps != null ? y.reps : ''}" placeholder="0"></label>`
            : `<label class="fza-c"><span>Peso (kg)</span>
                 <input type="number" inputmode="decimal" min="0" step="0.5"
                        data-fza="${ej.id}" data-campo="kg" value="${y.kg != null ? y.kg : ''}"
                        placeholder="${prev ? prev.kg : '0'}"></label>
               <label class="fza-c"><span>Reps logradas</span>
                 <input type="number" inputmode="numeric" min="0" step="1"
                        data-fza="${ej.id}" data-campo="reps" value="${y.reps != null ? y.reps : ''}" placeholder="0"></label>`}
        </div>
        <span class="fza-prev">${esc(ref)}</span>
      </div>`;
    }).join('');
    bloque.hidden = false;
  }

  function recogerFuerza(fecha) {
    const datos = {};
    document.querySelectorAll('#fza-lista [data-fza]').forEach(inp => {
      const v = parseFloat(inp.value);
      if (!isFinite(v)) return;
      const id = inp.dataset.fza;
      datos[id] = datos[id] || {};
      datos[id][inp.dataset.campo] = v;
    });
    if (Object.keys(datos).length) { fuerza[fecha] = datos; }
    else { delete fuerza[fecha]; }
    saveFza();
  }

  document.getElementById('f-rpe').addEventListener('input', syncRpe);
  document.getElementById('f-km').addEventListener('input', syncRitmo);
  document.getElementById('f-time').addEventListener('input', syncRitmo);
  document.getElementById('sheet-cancel').onclick = closeSheet;
  backdrop.onclick = closeSheet;
  document.getElementById('sheet-delete').onclick = () => {
    if (editingId) { delete log[editingId]; save(); }
    closeSheet(); render(); toast('Registro borrado');
  };
  document.getElementById('log-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!editingId) return;
    const km = parseFloat(document.getElementById('f-km').value);
    const tm = parseInt(document.getElementById('f-time').value, 10);
    const fc = parseInt(document.getElementById('f-fc').value, 10);
    const s = ALL.find(x => x.id === editingId);
    log[editingId] = {
      done: true,
      km: isNaN(km) ? 0 : km,
      timeMin: isNaN(tm) ? null : tm,
      fcMedia: isNaN(fc) ? null : fc,
      rpe: Number(document.getElementById('f-rpe').value),
      notes: document.getElementById('f-notes').value.trim(),
      loggedAt: new Date().toISOString(),
    };
    if (s) recogerFuerza(s.date);
    save(); closeSheet(); render(); toast('Guardado ✓');
  });

  // ── Navegación ────────────────────────────────────────────
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      view = btn.dataset.view;
      document.querySelectorAll('.tab').forEach(b => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      render();
      window.scrollTo(0, 0);
    });
  });
  document.getElementById('wk-prev').onclick = () => { if (weekIdx > 0) { weekIdx--; renderSemana(); } };
  document.getElementById('wk-next').onclick = () => { if (weekIdx < PLAN.weeks.length - 1) { weekIdx++; renderSemana(); } };

  // Delegación: cualquier elemento con data-log abre la hoja
  document.getElementById('main').addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-log]');
    if (el) openSheet(el.dataset.log);
  });

  // ── Utilidades ────────────────────────────────────────────
  function fmtKm(n) {
    const v = Number(n) || 0;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }
  // "sesión" → "sesiones", no "sesiónes": el plural pierde el acento.
  function pl(n, sing, plur) { return `${n} ${n === 1 ? sing : plur}`; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function selectText(node) {
    const r = document.createRange(); r.selectNodeContents(node);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  let toastT;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { el.hidden = true; }, 1900);
  }

  // ── Bootstrap ─────────────────────────────────────────────
  function render() {
    ['hoy', 'semana', 'plan', 'exportar'].forEach(v => {
      document.getElementById('view-' + v).hidden = v !== view;
    });
    if (view === 'hoy') renderHoy();
    if (view === 'semana') renderSemana();
    if (view === 'plan') renderPlan();
    if (view === 'exportar') renderExportar();
  }

  function updateCountdown() {
    const d = daysBetween(todayISO(), PLAN.race.date);
    document.getElementById('countdown').textContent =
      d > 1 ? `faltan ${d} días` : d === 1 ? 'mañana' : d === 0 ? '¡hoy es!' : 'completado';
  }

  // Arranca en la semana en curso (o la primera si aún no empieza)
  const wNow = weekIndexForDate(todayISO());
  weekIdx = wNow >= 0 ? wNow : (todayISO() > PLAN.race.date ? PLAN.weeks.length - 1 : 0);

  updateCountdown();
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // updateViaCache:'none' → sw.js siempre se pide a la red. Sin esto el
      // navegador puede quedarse con un service worker viejo hasta 24 h y
      // servir un plan rancio aunque ya se haya publicado el nuevo.
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
        .then(reg => reg.update())
        .catch(() => {});
    });
  }
})();
