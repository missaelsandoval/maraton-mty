#!/usr/bin/env python3
"""Cifra el archivo de datos que la app baja sola al arrancar.

    python3 marathon-app/tools/cifrar-datos.py --clave <archivo> \
        --entrada datos.json --salida marathon-app/datos.enc.json

`datos.enc.json` SÍ se versiona y se publica: el repo es público, y por eso el
contenido va cifrado. La clave NUNCA vive aquí — se pasa por archivo, y ese
archivo vive fuera del repo (en la carpeta Salud).

AES-256-GCM con clave derivada por PBKDF2-SHA256. GCM y no CBC porque GCM
autentica: si alguien altera el archivo publicado, el descifrado falla en vez
de entregar basura silenciosamente. El salt y el IV se generan nuevos en cada
corrida — reusar un IV con GCM rompe la garantía por completo.

Del lado del navegador lo descifra WebCrypto, que soporta exactamente este par
(PBKDF2-SHA256 + AES-GCM) en Safari. Requiere contexto seguro: HTTPS o
localhost, ambos cubiertos.
"""

import argparse
import base64
import json
import os
import sys

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Coste del derivado. Alto para que una clave corta siga costando fuerza bruta;
# lo bastante bajo para que el iPhone no se sienta trabado al abrir la app.
ITERACIONES = 250_000
VERSION = 1


def b64(raw: bytes) -> str:
    return base64.b64encode(raw).decode("ascii")


def derivar(clave: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERACIONES,
    )
    return kdf.derive(clave.encode("utf-8"))


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--clave", required=True, help="archivo con la clave, fuera del repo")
    p.add_argument("--entrada", required=True, help="JSON en claro")
    p.add_argument("--salida", required=True, help="destino cifrado")
    a = p.parse_args()

    with open(a.clave, encoding="utf-8") as f:
        clave = f.read().strip()
    if len(clave) < 8:
        print("La clave es demasiado corta (mínimo 8 caracteres).", file=sys.stderr)
        return 1

    with open(a.entrada, encoding="utf-8") as f:
        datos = json.load(f)          # se valida como JSON antes de cifrar

    plano = json.dumps(datos, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    salt = os.urandom(16)
    iv = os.urandom(12)               # 96 bits, el tamaño que GCM espera
    ct = AESGCM(derivar(clave, salt)).encrypt(iv, plano, None)

    sobre = {
        "v": VERSION,
        "alg": "AES-256-GCM",
        "kdf": "PBKDF2-SHA256",
        "iter": ITERACIONES,
        "salt": b64(salt),
        "iv": b64(iv),
        "ct": b64(ct),
        "generado": datos.get("generado"),
    }
    with open(a.salida, "w", encoding="utf-8") as f:
        json.dump(sobre, f, indent=1)
        f.write("\n")

    dias = len(datos.get("salud") or {})
    ses = len(datos.get("log") or {})
    print(f"OK: {dias} días de salud + {ses} sesiones -> {a.salida}")
    print(f"    {len(plano)} B en claro -> {len(ct)} B cifrados")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
