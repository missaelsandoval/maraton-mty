/* Maratón MTY — seguimiento del plan.
   Sin dependencias. Los datos viven en localStorage de este dispositivo. */
(function () {
  'use strict';

  const LOG_KEY = 'mmty-log-v1';
  const SALUD_KEY = 'mmty-salud-v1';

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

  // ── Estado ────────────────────────────────────────────────
  let log = load();
  let salud = loadSalud();
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
        else nuevoS[f].suenoMin = Math.round(v);
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
        timeMin: e.min != null ? Math.round(e.min) : (prev.timeMin ?? null),
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

  // ── Regla de FC en reposo ─────────────────────────────────
  function saludOrdenado() {
    return Object.keys(salud).sort().map(f => Object.assign({ fecha: f }, salud[f]));
  }
  function rhrBase() {
    const v = saludOrdenado().map(d => d.fcReposo).filter(Number.isFinite);
    if (v.length < 14) return RHR_BASE_DEFAULT;      // sin datos suficientes, la del plan
    const s = v.slice().sort((a, b) => a - b);
    return Math.round(s[Math.floor(s.length / 2)]);  // mediana: aguanta días sueltos altos
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
          <span class="pace-v">${esc(s.pace)}</span>
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
    const kmTxt = done && e && e.km
      ? `${fmtKm(e.km)} km`
      : (s.km > 0 ? `${fmtKm(s.km)} km` : '—');
    return `<button class="day ${isToday ? 'is-today' : ''} ${rest ? 'is-rest' : ''}" data-log="${s.id}">
      <span class="day-bar" style="background:${cfg.color}"></span>
      <span class="day-date">
        <span class="day-dow">${s.dow.slice(0, 3)}</span>
        <span class="day-num">${d.getDate()}</span>
      </span>
      <span class="day-body">
        <span class="day-type">${cfg.label}${s.fuerza ? `<span class="chip-f">Fuerza ${s.fuerza}</span>` : ''}</span>
        <span class="day-desc">${esc(s.desc)}</span>
        ${s.pace ? `<span class="day-pace">${esc(s.pace)}</span>` : ''}
      </span>
      <span class="day-km">${kmTxt}</span>
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

    html += `<h2 class="section-h">Tus ritmos</h2>
    <div class="card">
      <div class="zonas">
        ${PLAN.zonas.map(z => `<div class="zona">
          <span class="zona-n">${esc(z.zona)}</span>
          <span class="zona-p">${esc(z.minkm)}<small>/km</small></span>
          <span class="zona-k">${esc(z.kmh)} km/h</span>
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
      return `<h2 class="section-h">Tu cuerpo</h2>
      <div class="card">
        <p class="note" style="margin:0">Todavía no hay datos de Salud. En la pestaña
        <b>Exportar</b> está el botón para traerlos del iPhone con un Atajo:
        frecuencia en reposo, peso y sueño.</p>
      </div>`;
    }
    const serie = k => d.filter(x => Number.isFinite(x[k])).slice(-30);
    const fcr = serie('fcReposo'), pes = serie('peso'), sue = serie('suenoMin');
    const base = rhrBase();
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
        if (e.fcMedia) partes.push(`FC ${e.fcMedia} ppm`);
        const d = salud[s.date];
        if (d && Number.isFinite(d.fcReposo)) partes.push(`FC reposo ${d.fcReposo}`);
        if (e.rpe) partes.push(`sensación ${e.rpe}/10`);
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
          ${rows.length} sesión${rows.length === 1 ? '' : 'es'} registrada${rows.length === 1 ? '' : 's'} ·
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
          portapapeles) y toca el botón. Trae frecuencia en reposo, peso, sueño y
          los entrenamientos del Apple Watch.
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
      const blob = new Blob([JSON.stringify({ v: 2, exported: todayISO(), log, salud }, null, 2)],
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
          render();
          toast('Respaldo restaurado');
        } catch (e) { toast('Archivo no válido'); }
      };
      r.readAsText(f);
      ev.target.value = '';
    };
    document.getElementById('btn-wipe').onclick = () => {
      if (!confirm('¿Borrar todos los registros y los datos de Salud? Esto no se puede deshacer.')) return;
      log = {}; salud = {}; save(); saveSalud(); render(); toast('Registros borrados');
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
    document.getElementById('f-rpe').value = e.rpe != null ? e.rpe : 5;
    document.getElementById('f-notes').value = e.notes || '';
    document.getElementById('sheet-delete').hidden = !isDone(id);
    syncRpe();

    // Los campos de distancia no aplican a descanso / cruzado
    document.querySelector('.field-row').style.display = rest ? 'none' : 'flex';

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

  document.getElementById('f-rpe').addEventListener('input', syncRpe);
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
    log[editingId] = {
      done: true,
      km: isNaN(km) ? 0 : km,
      timeMin: isNaN(tm) ? null : tm,
      rpe: Number(document.getElementById('f-rpe').value),
      notes: document.getElementById('f-notes').value.trim(),
      loggedAt: new Date().toISOString(),
    };
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
