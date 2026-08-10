#!/usr/bin/env python3
"""Genera el Atajo "Salud → Maratón" como archivo .shortcut firmado.

    python3 marathon-app/tools/build-shortcut.py

Produce `dist/Salud a Maraton.shortcut`, listo para mandar al iPhone. Firmar
requiere macOS con sesión de iCloud iniciada: `shortcuts sign` no existe en iOS
y desde iOS 15 un atajo sin firma no se puede importar.

El atajo lee Salud y deja en el portapapeles las líneas que la app entiende
(`FCR`, `PESO`, `SUENO`). Formato y semántica: ../README.md.

Por qué un generador y no armarlo a mano en la app Atajos: son ~30 acciones con
referencias cruzadas por UUID. A mano es media hora de tapping y no queda
registro de por qué cada parámetro es lo que es.
"""

import os
import plistlib
import subprocess
import sys
import uuid

# Cuántas muestras trae cada métrica. Con una lectura diaria son ~2 meses,
# de sobra para tapar huecos; reimportar días repetidos no duplica nada.
LIMITE_MUESTRAS = 60

AQUI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(AQUI, "dist")
NOMBRE = "Salud a Maraton"

# U+FFFC OBJECT REPLACEMENT CHARACTER: el hueco donde Atajos incrusta una
# variable dentro de un texto. La posición se declara aparte, en UTF-16.
ORC = "￼"


def u():
    return str(uuid.uuid4()).upper()


def accion(ident, params=None):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions." + ident,
        "WFWorkflowActionParameters": params or {},
    }


def salida_de(uuid_, nombre):
    """Referencia a la salida de otra acción, ocupando todo el campo."""
    return {
        "Value": {"OutputUUID": uuid_, "OutputName": nombre, "Type": "ActionOutput"},
        "WFSerializationType": "WFTextTokenAttachment",
    }


def variable(nombre, propiedad=None):
    """Referencia a una variable con nombre; opcionalmente a una propiedad suya.

    `propiedad` usa un "aggrandizement": es cómo Atajos representa
    "la Fecha de inicio de este elemento" en vez del elemento entero.
    """
    v = {"VariableName": nombre, "Type": "Variable"}
    if propiedad:
        v["Aggrandizements"] = [
            {"Type": "WFPropertyVariableAggrandizement", "PropertyName": propiedad}
        ]
    return v


def campo(valor):
    """Envuelve un Value para que ocupe un campo completo."""
    return {"Value": valor, "WFSerializationType": "WFTextTokenAttachment"}


def texto(partes):
    """partes: lista de str | dict(Value) → WFTextTokenString.

    Las posiciones van en índices UTF-16 (semántica de NSString), no en
    caracteres Python: un emoji cuenta doble. Con puro ASCII da igual, pero
    calcularlo bien cuesta una línea.
    """
    s, rangos = "", {}
    for p in partes:
        if isinstance(p, str):
            s += p
        else:
            rangos["{%d, 1}" % (len(s.encode("utf-16-le")) // 2)] = p
            s += ORC
    val = {"string": s}
    if rangos:
        val["attachmentsByRange"] = rangos
    return {"Value": val, "WFSerializationType": "WFTextTokenString"}


# ── Un bloque por métrica ─────────────────────────────────────────────────
def filtro_por_tipo(tipo_legible):
    """El tipo de muestra NO es un parámetro suelto.

    "Buscar muestras de salud" hereda de WFContentItemFilterAction: el tipo va
    dentro de la tabla de filtros, como una fila fija con `Property = "Type"`.
    Tanto que `readableSampleType` en el binario de Apple no es un campo
    guardado sino un getter que va a leer esa fila.

    Y el valor es la **etiqueta que se ve en pantalla** ("Weight"), no el
    identificador de HealthKit ("HKQuantityTypeIdentifierBodyMass"): Atajos
    traduce de la etiqueta al identificador al ejecutar, no al revés.
    """
    return {
        "Value": {
            "WFActionParameterFilterPrefix": 1,
            "WFActionParameterFilterTemplates": [{
                "Bounded": True,
                "Operator": 4,               # 4 = "es"
                "Property": "Type",
                "Removable": False,          # la fila del tipo no se puede quitar
                "Values": {"Enumeration": {
                    "Value": tipo_legible,
                    "WFSerializationType": "WFStringSubstitutableState",
                }},
            }],
            "WFContentPredicateBoundedDate": False,
        },
        "WFSerializationType": "WFContentPredicateTableTemplate",
    }


def bloque(etiqueta, tipo_legible, unidad, comentario):
    """Busca las muestras de un tipo y escupe una línea `<ETIQUETA> <fecha>
    <valor>` por cada una en la variable `salida`.

    **Sin agrupar por día, a propósito.** "Agrupar por día" suena a lo que uno
    quiere, pero la descripción del propio parámetro en el binario de Apple es
    "grouping by day gives you only the daily **totals**": suma, no promedia, y
    no hay manera de pedirle promedio. En pasos eso está bien; en frecuencia en
    reposo, un día con dos muestras de 55 reportaría 110 ppm — un número
    creíble, silencioso y falso, que además dispararía la regla de alto del
    plan. Sin agrupar, cada línea es una lectura real.

    Que un día traiga dos líneas no estorba: la app fusiona por fecha y se
    queda con una. Reimportar tampoco duplica.
    """
    id_find, id_fecha, grupo = u(), u(), u()
    nombre_find = etiqueta.title() + "Muestras"
    params = {
        "UUID": id_find,
        "CustomOutputName": nombre_find,
        "WFContentItemFilter": filtro_por_tipo(tipo_legible),
        "WFContentItemSortProperty": "Start Date",
        "WFContentItemSortOrder": "Latest First",
        "WFContentItemLimitEnabled": True,
        "WFContentItemLimitNumber": LIMITE_MUESTRAS,
        # La unidad no es cosmética: la muestra se convierte a ella antes de
        # leer el valor. Con "lb" en vez de "kg" el número cambia.
        "WFHKSampleFilteringUnit": unidad,
    }
    return [
        accion("comment", {"WFCommentActionText": comentario}),
        accion("filter.health.quantity", params),
        accion("repeat.each", {
            "GroupingIdentifier": grupo,
            "WFControlFlowMode": 0,
            "WFInput": salida_de(id_find, nombre_find),
        }),
        # La fecha de la muestra, en el formato que la app espera.
        accion("format.date", {
            "UUID": id_fecha,
            "CustomOutputName": "Fecha" + etiqueta.title(),
            "WFDate": campo(variable("Repeat Item", "Start Date")),
            "WFDateFormatStyle": "Custom",
            "WFDateFormat": "yyyy-MM-dd",
            "WFTimeFormatStyle": "None",
        }),
        accion("gettext", {
            "WFTextActionText": texto([
                etiqueta + " ",
                {"OutputUUID": id_fecha, "OutputName": "Fecha" + etiqueta.title(),
                 "Type": "ActionOutput"},
                " ",
                variable("Repeat Item", "Value"),
            ])
        }),
        accion("appendvariable", {"WFVariableName": "salida"}),
        accion("repeat.each", {
            "GroupingIdentifier": grupo, "WFControlFlowMode": 2, "UUID": u(),
        }),
    ]


def construir():
    acciones = [
        accion("comment", {"WFCommentActionText": (
            "Salud → Maratón\n\n"
            "Deja en el portapapeles las líneas que lee la app de maratón "
            "(Exportar → Importar de Salud).\n\n"
            "Generado por marathon-app/tools/build-shortcut.py. Si lo editas "
            "aquí, anota el cambio allá o se pierde en la siguiente "
            "regeneración."
        )}),
        # Semilla: si una búsqueda no devuelve nada, "Añadir a variable" nunca
        # crearía `salida` y "Combinar texto" fallaría con la variable ausente.
        # La línea vacía que introduce la ignora el parser de la app.
        accion("gettext", {"WFTextActionText": ""}),
        accion("setvariable", {"WFVariableName": "salida"}),
    ]

    # Las etiquetas salen de HealthKit (Localizable-DataTypes.loctable):
    # RESTING_HEART_RATE → "Resting Heart Rate", BODY_MASS → "Weight",
    # SLEEP_ANALYSIS → "Sleep". Van en inglés aunque el iPhone esté en
    # español: es la clave interna, no lo que se muestra.
    acciones += bloque(
        "FCR", "Resting Heart Rate", "count/min",
        "Frecuencia en reposo — alimenta la regla de alto del plan: "
        "3 días seguidos ≥ base+7 y toca descansar.")
    acciones += bloque(
        "PESO", "Weight", "kg",
        "Peso corporal — tendencia de 30 días en Plan → Tu cuerpo.")

    # No hay bloque de sueño, y no es un olvido. El sueño se guarda como
    # muestra de *categoría*: su valor es el código de la etapa
    # (0 en cama, 1 dormido, 2 despierto, 3 ligero, 4 profundo, 5 REM), no
    # minutos. Un bloque ingenuo escribiría "SUENO <fecha> 3" y la app lo
    # graficaría como tres horas de sueño: un número creíble y falso. Sacarlo
    # bien pide sumar la propiedad Duración solo de las etapas dormidas, y eso
    # no se puede verificar sin el iPhone en la mano. Ver README.

    acciones += [
        accion("text.combine", {
            "text": campo(variable("salida")),
            "WFTextSeparator": "New Lines",
        }),
        accion("setclipboard", {}),
        accion("notification", {
            "WFNotificationActionTitle": "Salud → Maratón",
            "WFNotificationActionBody": "Copiado. Abre la app → Exportar → Importar de Salud.",
            "WFNotificationActionSound": False,
        }),
    ]

    return {
        "WFWorkflowActions": acciones,
        # 900 = iOS 16. Más alto y un iPhone viejo dice "formato demasiado
        # nuevo" y ni siquiera deja abrirlo.
        "WFWorkflowClientVersion": "3218.0.4.100",
        "WFWorkflowMinimumClientVersion": 900,
        "WFWorkflowMinimumClientVersionString": "900",
        "WFWorkflowIcon": {
            "WFWorkflowIconGlyphNumber": 61440,
            "WFWorkflowIconStartColor": 4282601983,
        },
        "WFWorkflowImportQuestions": [],
        "WFWorkflowTypes": [],
        "WFWorkflowInputContentItemClasses": [],
        "WFQuickActionSurfaces": [],
        "WFWorkflowHasOutputFallback": False,
        "WFWorkflowHasShortcutInputVariables": False,
    }


def main():
    os.makedirs(DIST, exist_ok=True)
    # La entrada TIENE que llamarse .shortcut: `shortcuts sign` decide por la
    # extensión, no por el contenido, y con .plist responde "isn't in the
    # correct format" aunque el plist sea idéntico y válido.
    sin_firmar = os.path.join(DIST, "_sin-firmar.shortcut")
    firmado = os.path.join(DIST, NOMBRE + ".shortcut")

    with open(sin_firmar, "wb") as f:
        plistlib.dump(construir(), f, fmt=plistlib.FMT_XML, sort_keys=True)

    if os.path.exists(firmado):
        os.remove(firmado)
    r = subprocess.run(
        ["shortcuts", "sign", "--mode", "anyone", "-i", sin_firmar, "-o", firmado],
        capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(firmado):
        sys.exit("No se pudo firmar: " + (r.stderr or r.stdout).strip())

    # `shortcuts sign` valida que sea un plist y nada más: firma feliz un
    # atajo con acciones inexistentes. Que esto pase no dice que funcione.
    with open(firmado, "rb") as f:
        if f.read(4) != b"AEA1":
            sys.exit("El archivo firmado no trae la firma esperada (AEA1).")

    n = len(construir()["WFWorkflowActions"])
    print("%s\n%d acciones · %d bytes" % (firmado, n, os.path.getsize(firmado)))


if __name__ == "__main__":
    main()
