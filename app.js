/* Maratón MTY — seguimiento del plan.
   Sin dependencias. Los datos viven en localStorage de este dispositivo. */
(function () {
  'use strict';

  const LOG_KEY = 'mmty-log-v1';

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
    document.getElementById('btn-backup').onclick = () => {
      const blob = new Blob([JSON.stringify({ v: 1, exported: todayISO(), log }, null, 2)],
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
          save(); render();
          toast('Respaldo restaurado');
        } catch (e) { toast('Archivo no válido'); }
      };
      r.readAsText(f);
      ev.target.value = '';
    };
    document.getElementById('btn-wipe').onclick = () => {
      if (!confirm('¿Borrar todos los registros? Esto no se puede deshacer.')) return;
      log = {}; save(); render(); toast('Registros borrados');
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
