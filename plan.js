/* Plan del Maratón Powerade Monterrey 2026 — 19 semanas.
   GENERADO: no editar a mano. Fuente: plan-maraton-monterrey-2026.html
   Invariante: targetKm de cada semana == suma de los km de sus sesiones. */
const PLAN = {
 "race": {
  "name": "Maratón Powerade Monterrey",
  "date": "2026-12-13",
  "time": "6:45 AM",
  "location": "Parque Fundidora",
  "distanceKm": 42.195,
  "objetivo": "6 h 05",
  "limite": "6 h 30",
  "ritmoMeta": "8:47/km · 4.2 mph",
  "corte": "Medio maratón (km 21.1) a las 3 h 15"
 },
 "startDate": "2026-08-03",
 "estrategia": "Trote–caminata 5:1 — cinco minutos de trote, uno de caminata. Se usa desde la semana 3 en todos los largos, y el día de la carrera desde el kilómetro 1.",
 "calor": "Semanas 1 a 9: a 30 °C o más, súmale 45–75 s/km a todas las zonas. El estímulo es el esfuerzo, no el número del reloj.",
 "zonas": [
  {
   "zona": "Recuperación",
   "minkm": "11:00–12:00",
   "kmh": "5.0–5.5",
   "mph": "3.1–3.4",
   "sensacion": "Conversación completa, casi caminata"
  },
  {
   "zona": "Fácil",
   "minkm": "10:15–11:00",
   "kmh": "5.5–5.9",
   "mph": "3.4–3.6",
   "sensacion": "Puedes hablar en frases completas"
  },
  {
   "zona": "Ritmo maratón",
   "minkm": "8:45–9:00",
   "kmh": "6.7–6.9",
   "mph": "4.1–4.3",
   "sensacion": "Cómodo pero con atención"
  },
  {
   "zona": "Umbral / tempo",
   "minkm": "8:00–8:20",
   "kmh": "7.2–7.5",
   "mph": "4.5–4.7",
   "sensacion": "Frases de 3–4 palabras"
  },
  {
   "zona": "Intervalos",
   "minkm": "7:15–7:45",
   "kmh": "7.7–8.3",
   "mph": "4.8–5.1",
   "sensacion": "Solo palabras sueltas"
  }
 ],
 "weeks": [
  {
   "num": 1,
   "start": "2026-08-03",
   "end": "2026-08-09",
   "phase": "Reconstrucción",
   "phaseLabel": "Reconstrucción",
   "deload": false,
   "targetKm": 12,
   "longKm": 4,
   "sessions": [
    {
     "id": "s2026-08-03",
     "date": "2026-08-03",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-08-04",
     "date": "2026-08-04",
     "dow": "martes",
     "type": "facil",
     "km": 3,
     "desc": "3 km fácil — si necesitas caminar, camina",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-08-05",
     "date": "2026-08-05",
     "dow": "miércoles",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata 30 min"
    },
    {
     "id": "s2026-08-06",
     "date": "2026-08-06",
     "dow": "jueves",
     "type": "facil",
     "km": 3,
     "desc": "3 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-08-07",
     "date": "2026-08-07",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-08-08",
     "date": "2026-08-08",
     "dow": "sábado",
     "type": "facil",
     "km": 2,
     "desc": "2 km muy suave",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-08-09",
     "date": "2026-08-09",
     "dow": "domingo",
     "type": "largo",
     "km": 4,
     "desc": "4 km continuo, ritmo cómodo",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    }
   ]
  },
  {
   "num": 2,
   "start": "2026-08-10",
   "end": "2026-08-16",
   "phase": "Reconstrucción",
   "phaseLabel": "Reconstrucción",
   "deload": false,
   "targetKm": 15,
   "longKm": 5,
   "sessions": [
    {
     "id": "s2026-08-10",
     "date": "2026-08-10",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-08-11",
     "date": "2026-08-11",
     "dow": "martes",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-08-12",
     "date": "2026-08-12",
     "dow": "miércoles",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata 30 min"
    },
    {
     "id": "s2026-08-13",
     "date": "2026-08-13",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-08-14",
     "date": "2026-08-14",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-08-15",
     "date": "2026-08-15",
     "dow": "sábado",
     "type": "facil",
     "km": 2,
     "desc": "2 km suave",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-08-16",
     "date": "2026-08-16",
     "dow": "domingo",
     "type": "largo",
     "km": 5,
     "desc": "5 km continuo",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    }
   ]
  },
  {
   "num": 3,
   "start": "2026-08-17",
   "end": "2026-08-23",
   "phase": "Reconstrucción",
   "phaseLabel": "Reconstrucción",
   "deload": false,
   "targetKm": 18,
   "longKm": 7,
   "sessions": [
    {
     "id": "s2026-08-17",
     "date": "2026-08-17",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-08-18",
     "date": "2026-08-18",
     "dow": "martes",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-08-19",
     "date": "2026-08-19",
     "dow": "miércoles",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata 35 min"
    },
    {
     "id": "s2026-08-20",
     "date": "2026-08-20",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-08-21",
     "date": "2026-08-21",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-08-22",
     "date": "2026-08-22",
     "dow": "sábado",
     "type": "facil",
     "km": 3,
     "desc": "3 km suave",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-08-23",
     "date": "2026-08-23",
     "dow": "domingo",
     "type": "largo",
     "km": 7,
     "desc": "7 km en 5:1 — primera prueba del trote–caminata",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 4,
   "start": "2026-08-24",
   "end": "2026-08-30",
   "phase": "Reconstrucción",
   "phaseLabel": "Reconstrucción",
   "deload": true,
   "targetKm": 14,
   "longKm": 6,
   "sessions": [
    {
     "id": "s2026-08-24",
     "date": "2026-08-24",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-08-25",
     "date": "2026-08-25",
     "dow": "martes",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-08-26",
     "date": "2026-08-26",
     "dow": "miércoles",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata 30 min"
    },
    {
     "id": "s2026-08-27",
     "date": "2026-08-27",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-08-28",
     "date": "2026-08-28",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-08-29",
     "date": "2026-08-29",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-08-30",
     "date": "2026-08-30",
     "dow": "domingo",
     "type": "largo",
     "km": 6,
     "desc": "6 km en 5:1",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 5,
   "start": "2026-08-31",
   "end": "2026-09-06",
   "phase": "Reconstrucción",
   "phaseLabel": "Reconstrucción",
   "deload": false,
   "targetKm": 22,
   "longKm": 9,
   "sessions": [
    {
     "id": "s2026-08-31",
     "date": "2026-08-31",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-09-01",
     "date": "2026-09-01",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-09-02",
     "date": "2026-09-02",
     "dow": "miércoles",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil — empiezan 5 días de carrera",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-09-03",
     "date": "2026-09-03",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-09-04",
     "date": "2026-09-04",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-09-05",
     "date": "2026-09-05",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata o bici 30 min"
    },
    {
     "id": "s2026-09-06",
     "date": "2026-09-06",
     "dow": "domingo",
     "type": "largo",
     "km": 9,
     "desc": "9 km en 5:1",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 6,
   "start": "2026-09-07",
   "end": "2026-09-13",
   "phase": "Base aeróbica",
   "phaseLabel": "Base aeróbica",
   "deload": false,
   "targetKm": 26,
   "longKm": 11,
   "sessions": [
    {
     "id": "s2026-09-07",
     "date": "2026-09-07",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-09-08",
     "date": "2026-09-08",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-09-09",
     "date": "2026-09-09",
     "dow": "miércoles",
     "type": "calidad",
     "km": 4,
     "desc": "4 km + 6 rectas de 20 s — acelera progresivo, no esprint",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-09-10",
     "date": "2026-09-10",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-09-11",
     "date": "2026-09-11",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-09-12",
     "date": "2026-09-12",
     "dow": "sábado",
     "type": "facil",
     "km": 2,
     "desc": "2 km suave o bici 30 min",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-09-13",
     "date": "2026-09-13",
     "dow": "domingo",
     "type": "largo",
     "km": 11,
     "desc": "11 km en 5:1",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 7,
   "start": "2026-09-14",
   "end": "2026-09-20",
   "phase": "Base aeróbica",
   "phaseLabel": "Base aeróbica",
   "deload": false,
   "targetKm": 30,
   "longKm": 14,
   "sessions": [
    {
     "id": "s2026-09-14",
     "date": "2026-09-14",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-09-15",
     "date": "2026-09-15",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-09-16",
     "date": "2026-09-16",
     "dow": "miércoles",
     "type": "calidad",
     "km": 5,
     "desc": "5 km + 6 rectas de 20 s",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-09-17",
     "date": "2026-09-17",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-09-18",
     "date": "2026-09-18",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-09-19",
     "date": "2026-09-19",
     "dow": "sábado",
     "type": "facil",
     "km": 2,
     "desc": "2 km suave",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-09-20",
     "date": "2026-09-20",
     "dow": "domingo",
     "type": "largo",
     "km": 14,
     "desc": "14 km en 5:1 — primer largo con gel a los 40 min",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 8,
   "start": "2026-09-21",
   "end": "2026-09-27",
   "phase": "Base aeróbica",
   "phaseLabel": "Base aeróbica",
   "deload": true,
   "targetKm": 23,
   "longKm": 10,
   "sessions": [
    {
     "id": "s2026-09-21",
     "date": "2026-09-21",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-09-22",
     "date": "2026-09-22",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-09-23",
     "date": "2026-09-23",
     "dow": "miércoles",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-09-24",
     "date": "2026-09-24",
     "dow": "jueves",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-09-25",
     "date": "2026-09-25",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso o caminata"
    },
    {
     "id": "s2026-09-26",
     "date": "2026-09-26",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso o caminata"
    },
    {
     "id": "s2026-09-27",
     "date": "2026-09-27",
     "dow": "domingo",
     "type": "largo",
     "km": 10,
     "desc": "10 km en 5:1",
     "pace": "prom 10:30–11:30/km · 3.2–3.6 mph"
    }
   ]
  },
  {
   "num": 9,
   "start": "2026-09-28",
   "end": "2026-10-04",
   "phase": "Base aeróbica",
   "phaseLabel": "Base aeróbica",
   "deload": false,
   "targetKm": 34,
   "longKm": 17,
   "sessions": [
    {
     "id": "s2026-09-28",
     "date": "2026-09-28",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-09-29",
     "date": "2026-09-29",
     "dow": "martes",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-09-30",
     "date": "2026-09-30",
     "dow": "miércoles",
     "type": "calidad",
     "km": 6,
     "desc": "6 km con últimos 2 km progresivos",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-01",
     "date": "2026-10-01",
     "dow": "jueves",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-02",
     "date": "2026-10-02",
     "dow": "viernes",
     "type": "facil",
     "km": 2,
     "desc": "2 km trote",
     "pace": "11:00–12:00/km · 3.1–3.4 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-10-03",
     "date": "2026-10-03",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Bici o elíptica 40 min"
    },
    {
     "id": "s2026-10-04",
     "date": "2026-10-04",
     "dow": "domingo",
     "type": "largo",
     "km": 17,
     "desc": "17 km en 5:1 — gel cada 40 min, sin excepción",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 10,
   "start": "2026-10-05",
   "end": "2026-10-11",
   "phase": "Base aeróbica",
   "phaseLabel": "Base aeróbica",
   "deload": false,
   "targetKm": 38,
   "longKm": 20,
   "sessions": [
    {
     "id": "s2026-10-05",
     "date": "2026-10-05",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-10-06",
     "date": "2026-10-06",
     "dow": "martes",
     "type": "facil",
     "km": 4,
     "desc": "4 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-10-07",
     "date": "2026-10-07",
     "dow": "miércoles",
     "type": "calidad",
     "km": 6,
     "desc": "6 km con 3 km a ritmo maratón en medio",
     "pace": "8:45–9:00/km · 4.1–4.3 mph"
    },
    {
     "id": "s2026-10-08",
     "date": "2026-10-08",
     "dow": "jueves",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-09",
     "date": "2026-10-09",
     "dow": "viernes",
     "type": "facil",
     "km": 3,
     "desc": "3 km trote",
     "pace": "11:00–12:00/km · 3.1–3.4 mph",
     "fuerza": "B"
    },
    {
     "id": "s2026-10-10",
     "date": "2026-10-10",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Bici o elíptica 40 min"
    },
    {
     "id": "s2026-10-11",
     "date": "2026-10-11",
     "dow": "domingo",
     "type": "largo",
     "km": 20,
     "desc": "20 km en 5:1",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 11,
   "start": "2026-10-12",
   "end": "2026-10-18",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": false,
   "targetKm": 42,
   "longKm": 23,
   "sessions": [
    {
     "id": "s2026-10-12",
     "date": "2026-10-12",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-10-13",
     "date": "2026-10-13",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-10-14",
     "date": "2026-10-14",
     "dow": "miércoles",
     "type": "calidad",
     "km": 8,
     "desc": "Tempo: 2 km calentamiento + 3 km fuerte + 3 km suave",
     "pace": "8:00–8:20/km · 4.5–4.7 mph"
    },
    {
     "id": "s2026-10-15",
     "date": "2026-10-15",
     "dow": "jueves",
     "type": "facil",
     "km": 6,
     "desc": "6 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-16",
     "date": "2026-10-16",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B + caminata",
     "fuerza": "B"
    },
    {
     "id": "s2026-10-17",
     "date": "2026-10-17",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Bici 40 min"
    },
    {
     "id": "s2026-10-18",
     "date": "2026-10-18",
     "dow": "domingo",
     "type": "largo",
     "km": 23,
     "desc": "23 km en 5:1, últimos 3 km a ritmo maratón",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 12,
   "start": "2026-10-19",
   "end": "2026-10-25",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": true,
   "targetKm": 32,
   "longKm": 16,
   "sessions": [
    {
     "id": "s2026-10-19",
     "date": "2026-10-19",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-10-20",
     "date": "2026-10-20",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-10-21",
     "date": "2026-10-21",
     "dow": "miércoles",
     "type": "calidad",
     "km": 6,
     "desc": "6 km con 6 rectas",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-22",
     "date": "2026-10-22",
     "dow": "jueves",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-23",
     "date": "2026-10-23",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B",
     "fuerza": "B"
    },
    {
     "id": "s2026-10-24",
     "date": "2026-10-24",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-10-25",
     "date": "2026-10-25",
     "dow": "domingo",
     "type": "largo",
     "km": 16,
     "desc": "16 km en 5:1 suave",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 13,
   "start": "2026-10-26",
   "end": "2026-11-01",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": false,
   "targetKm": 46,
   "longKm": 26,
   "sessions": [
    {
     "id": "s2026-10-26",
     "date": "2026-10-26",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-10-27",
     "date": "2026-10-27",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-10-28",
     "date": "2026-10-28",
     "dow": "miércoles",
     "type": "calidad",
     "km": 9,
     "desc": "Tempo: 2 km cal + 2 × 2 km fuerte (rec 3 min) + 3 km",
     "pace": "8:00–8:20/km · 4.5–4.7 mph"
    },
    {
     "id": "s2026-10-29",
     "date": "2026-10-29",
     "dow": "jueves",
     "type": "facil",
     "km": 6,
     "desc": "6 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-10-30",
     "date": "2026-10-30",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B + caminata",
     "fuerza": "B"
    },
    {
     "id": "s2026-10-31",
     "date": "2026-10-31",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Bici 40 min"
    },
    {
     "id": "s2026-11-01",
     "date": "2026-11-01",
     "dow": "domingo",
     "type": "largo",
     "km": 26,
     "desc": "26 km en 5:1, últimos 4 km a ritmo maratón",
     "pace": "prom 8:47–9:15/km · 4.0–4.2 mph"
    }
   ]
  },
  {
   "num": 14,
   "start": "2026-11-02",
   "end": "2026-11-08",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": false,
   "targetKm": 49,
   "longKm": 29,
   "sessions": [
    {
     "id": "s2026-11-02",
     "date": "2026-11-02",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-11-03",
     "date": "2026-11-03",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-11-04",
     "date": "2026-11-04",
     "dow": "miércoles",
     "type": "calidad",
     "km": 9,
     "desc": "Intervalos: 2 km cal + 5 × 1 km (rec 2 min trote) + 2 km",
     "pace": "7:15–7:45/km · 4.8–5.1 mph"
    },
    {
     "id": "s2026-11-05",
     "date": "2026-11-05",
     "dow": "jueves",
     "type": "facil",
     "km": 6,
     "desc": "6 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-11-06",
     "date": "2026-11-06",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B",
     "fuerza": "B"
    },
    {
     "id": "s2026-11-07",
     "date": "2026-11-07",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Bici 40 min"
    },
    {
     "id": "s2026-11-08",
     "date": "2026-11-08",
     "dow": "domingo",
     "type": "largo",
     "km": 29,
     "desc": "29 km en 5:1, últimos 5 km a ritmo maratón",
     "pace": "prom 8:47–9:15/km · 4.0–4.2 mph"
    }
   ]
  },
  {
   "num": 15,
   "start": "2026-11-09",
   "end": "2026-11-15",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": true,
   "targetKm": 37,
   "longKm": 18,
   "sessions": [
    {
     "id": "s2026-11-09",
     "date": "2026-11-09",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-11-10",
     "date": "2026-11-10",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-11-11",
     "date": "2026-11-11",
     "dow": "miércoles",
     "type": "calidad",
     "km": 7,
     "desc": "Tempo corto: 2 km cal + 3 km fuerte + 2 km",
     "pace": "8:00–8:20/km · 4.5–4.7 mph"
    },
    {
     "id": "s2026-11-12",
     "date": "2026-11-12",
     "dow": "jueves",
     "type": "facil",
     "km": 7,
     "desc": "7 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-11-13",
     "date": "2026-11-13",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B",
     "fuerza": "B"
    },
    {
     "id": "s2026-11-14",
     "date": "2026-11-14",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-11-15",
     "date": "2026-11-15",
     "dow": "domingo",
     "type": "largo",
     "km": 18,
     "desc": "18 km en 5:1 suave",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 16,
   "start": "2026-11-16",
   "end": "2026-11-22",
   "phase": "Trabajo específico",
   "phaseLabel": "Trabajo específico",
   "deload": false,
   "targetKm": 54,
   "longKm": 32,
   "sessions": [
    {
     "id": "s2026-11-16",
     "date": "2026-11-16",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-11-17",
     "date": "2026-11-17",
     "dow": "martes",
     "type": "facil",
     "km": 6,
     "desc": "6 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-11-18",
     "date": "2026-11-18",
     "dow": "miércoles",
     "type": "calidad",
     "km": 10,
     "desc": "Tempo: 2 km cal + 2 × 2.5 km fuerte (rec 3 min) + 3 km",
     "pace": "8:00–8:20/km · 4.5–4.7 mph"
    },
    {
     "id": "s2026-11-19",
     "date": "2026-11-19",
     "dow": "jueves",
     "type": "facil",
     "km": 6,
     "desc": "6 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-11-20",
     "date": "2026-11-20",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B ligera",
     "fuerza": "B"
    },
    {
     "id": "s2026-11-21",
     "date": "2026-11-21",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso completo"
    },
    {
     "id": "s2026-11-22",
     "date": "2026-11-22",
     "dow": "domingo",
     "type": "largo",
     "km": 32,
     "desc": "32 km · SIMULACRO DE CARRERA — desayuno y ropa de carrera, 5:1 desde el km 1, geles cada 35 min, últimos 6 km a ritmo maratón",
     "pace": "prom 8:47–9:15/km · 4.0–4.2 mph"
    }
   ]
  },
  {
   "num": 17,
   "start": "2026-11-23",
   "end": "2026-11-29",
   "phase": "Afinamiento",
   "phaseLabel": "Afinamiento",
   "deload": false,
   "targetKm": 42,
   "longKm": 24,
   "sessions": [
    {
     "id": "s2026-11-23",
     "date": "2026-11-23",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-11-24",
     "date": "2026-11-24",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph",
     "fuerza": "A"
    },
    {
     "id": "s2026-11-25",
     "date": "2026-11-25",
     "dow": "miércoles",
     "type": "calidad",
     "km": 8,
     "desc": "Tempo: 2 km cal + 4 km a ritmo maratón + 2 km",
     "pace": "8:45–9:00/km · 4.1–4.3 mph"
    },
    {
     "id": "s2026-11-26",
     "date": "2026-11-26",
     "dow": "jueves",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-11-27",
     "date": "2026-11-27",
     "dow": "viernes",
     "type": "cruzado",
     "km": 0,
     "desc": "Fuerza B ligera",
     "fuerza": "B"
    },
    {
     "id": "s2026-11-28",
     "date": "2026-11-28",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-11-29",
     "date": "2026-11-29",
     "dow": "domingo",
     "type": "largo",
     "km": 24,
     "desc": "24 km en 5:1, últimos 4 km a ritmo maratón",
     "pace": "prom 8:47–9:15/km · 4.0–4.2 mph"
    }
   ]
  },
  {
   "num": 18,
   "start": "2026-11-30",
   "end": "2026-12-06",
   "phase": "Afinamiento",
   "phaseLabel": "Afinamiento",
   "deload": true,
   "targetKm": 30,
   "longKm": 16,
   "sessions": [
    {
     "id": "s2026-11-30",
     "date": "2026-11-30",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-12-01",
     "date": "2026-12-01",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil + fuerza corporal",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-12-02",
     "date": "2026-12-02",
     "dow": "miércoles",
     "type": "calidad",
     "km": 6,
     "desc": "6 km con 3 km a ritmo maratón",
     "pace": "8:45–9:00/km · 4.1–4.3 mph"
    },
    {
     "id": "s2026-12-03",
     "date": "2026-12-03",
     "dow": "jueves",
     "type": "facil",
     "km": 3,
     "desc": "3 km fácil",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-12-04",
     "date": "2026-12-04",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso"
    },
    {
     "id": "s2026-12-05",
     "date": "2026-12-05",
     "dow": "sábado",
     "type": "cruzado",
     "km": 0,
     "desc": "Caminata 30 min"
    },
    {
     "id": "s2026-12-06",
     "date": "2026-12-06",
     "dow": "domingo",
     "type": "largo",
     "km": 16,
     "desc": "16 km en 5:1 muy suave",
     "pace": "prom 9:45–10:15/km · 3.6–3.8 mph"
    }
   ]
  },
  {
   "num": 19,
   "start": "2026-12-07",
   "end": "2026-12-13",
   "phase": "Afinamiento",
   "phaseLabel": "Afinamiento",
   "deload": false,
   "targetKm": 54.195,
   "longKm": 42.195,
   "sessions": [
    {
     "id": "s2026-12-07",
     "date": "2026-12-07",
     "dow": "lunes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso total"
    },
    {
     "id": "s2026-12-08",
     "date": "2026-12-08",
     "dow": "martes",
     "type": "facil",
     "km": 5,
     "desc": "5 km fácil · la carga de carbohidratos empieza el jueves",
     "pace": "10:15–11:00/km · 3.4–3.6 mph"
    },
    {
     "id": "s2026-12-09",
     "date": "2026-12-09",
     "dow": "miércoles",
     "type": "calidad",
     "km": 4,
     "desc": "4 km con 4 × 400 m a ritmo maratón — solo para despertar las piernas",
     "pace": "8:45–9:00/km · 4.1–4.3 mph"
    },
    {
     "id": "s2026-12-10",
     "date": "2026-12-10",
     "dow": "jueves",
     "type": "facil",
     "km": 3,
     "desc": "3 km muy suave · recoger kit si abre este día",
     "pace": "11:00–12:00/km · 3.1–3.4 mph"
    },
    {
     "id": "s2026-12-11",
     "date": "2026-12-11",
     "dow": "viernes",
     "type": "descanso",
     "km": 0,
     "desc": "Descanso · recoger número y chip · piernas arriba"
    },
    {
     "id": "s2026-12-12",
     "date": "2026-12-12",
     "dow": "sábado",
     "type": "descanso",
     "km": 0,
     "desc": "Caminata 20 min · cena de carbohidratos 19:00 · dormir temprano"
    },
    {
     "id": "s2026-12-13",
     "date": "2026-12-13",
     "dow": "domingo",
     "type": "carrera",
     "km": 42.195,
     "desc": "MARATÓN — 6:45 AM · 5:1 desde el kilómetro 1",
     "pace": "prom 8:47–9:15/km · 4.0–4.2 mph"
    }
   ]
  }
 ]
};
