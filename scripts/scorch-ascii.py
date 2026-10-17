#!/usr/bin/env python3
"""
=============================================================================
 SCORCH-ASCII // Convertidor de Imágenes a Arte ASCII (Velgrynd Edition)
 Ryukami Labs // Sistema de Diseño v4.1
=============================================================================
Convierte cualquier imagen (PNG, JPG, WEBP, etc.) en texto ASCII coloreado
con la paleta de Velgrynd (#E63946, #9B1B30, #4DA3FF, #F4D35E).
Formatos soportados: Terminal ANSI, HTML (<pre class="ascii-art">) y Markdown.
"""

import sys
import os
import argparse
from PIL import Image

# Rampas de caracteres ASCII según densidad visual (de menor a mayor)
ASCII_RAMP_STANDARD = " .:-=+*#%@"
ASCII_RAMP_DETAILED = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
ASCII_RAMP_BLOCKS   = " ░▒▓█"

# Paleta canónica de Velgrynd
PALETTE_VELGRYND = {
    "crimson": (230, 57, 70),    # #E63946 (Escamas primarias / Fuego)
    "maroon":  (155, 27, 48),    # #9B1B30 (Sombra de escamas)
    "cyan":    (77, 163, 255),   # #4DA3FF (Bigotes / REA Tech)
    "gold":    (244, 211, 94),   # #F4D35E (Ojos de dragón / Luz alta)
    "canvas":  (11, 15, 23)      # #0B0F17 (Fondo terminal)
}

def rgb_to_ansi(r, g, b, text):
    """Genera secuencias ANSI TrueColor (24-bit) para la terminal."""
    return f"\033[38;2;{r};{g};{b}m{text}\033[0m"

def get_velgrynd_color(r, g, b, brightness):
    """
    Mapea el píxel a la paleta matemática de Velgrynd:
    - Zonas muy brillantes -> Oro (#F4D35E) o Cian (#4DA3FF) según tono
    - Zonas medias -> Carmesí Scorch (#E63946)
    - Zonas oscuras -> Rojo Sangre (#9B1B30)
    """
    if brightness > 210:
        return PALETTE_VELGRYND["gold"]
    elif brightness > 150:
        # Si tiene más componente azul que rojo, asignar cian
        if b > r and b > 120:
            return PALETTE_VELGRYND["cyan"]
        return PALETTE_VELGRYND["crimson"]
    elif brightness > 80:
        return PALETTE_VELGRYND["maroon"]
    else:
        return (70, 15, 25)

def convert_image_to_ascii(image_path, width=60, ramp=ASCII_RAMP_STANDARD,
                           palette_mode="velgrynd", format_mode="ansi",
                           invert=False, contrast=1.0):
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"❌ Error al abrir la imagen '{image_path}': {e}", file=sys.stderr)
        sys.exit(1)

    # Convertir a RGB (manejar canal alfa RGBA)
    if img.mode == 'RGBA':
        # Fondo blanco para imágenes transparentes
        background = Image.new('RGB', img.size, (255, 255, 255) if invert else (11, 15, 23))
        background.paste(img, mask=img.split()[3])
        img = background
    else:
        img = img.convert('RGB')

    # Calcular nuevas dimensiones respetando la proporción de fuentes de terminal (~0.5)
    orig_w, orig_h = img.size
    aspect_ratio = orig_h / orig_w
    height = int(width * aspect_ratio * 0.52)
    if height < 1:
        height = 1

    img = img.resize((width, height), Image.Resampling.LANCZOS)
    pixels = img.load()

    output_lines = []

    for y in range(height):
        line_chars = []
        for x in range(width):
            r, g, b = pixels[x, y]
            # Luminosidad perceptual estándar
            brightness = int(0.299 * r + 0.587 * g + 0.114 * b)
            
            if invert:
                brightness = 255 - brightness

            # Elegir carácter de la rampa
            ramp_idx = int((brightness / 255) * (len(ramp) - 1))
            char = ramp[ramp_idx]

            # Si es espacio o negro total
            if brightness < 15 and not invert:
                char = " "

            # Asignar color según el modo seleccionado
            if palette_mode == "velgrynd":
                cr, cg, cb = get_velgrynd_color(r, g, b, brightness)
            elif palette_mode == "truecolor":
                cr, cg, cb = r, g, b
            else: # mono
                cr, cg, cb = 255, 255, 255

            if format_mode == "ansi":
                if char == " ":
                    line_chars.append(" ")
                else:
                    line_chars.append(rgb_to_ansi(cr, cg, cb, char))
            elif format_mode == "html":
                if char == " ":
                    line_chars.append(" ")
                else:
                    hex_color = f"#{cr:02x}{cg:02x}{cb:02x}"
                    line_chars.append(f'<span style="color:{hex_color}">{char}</span>')
            else: # markdown o texto plano
                line_chars.append(char)

        output_lines.append("".join(line_chars))

    if format_mode == "html":
        full_content = "\n".join(output_lines)
        return f'<pre class="ascii-art" style="background:#0B0F17; padding:1rem; border:2px solid #000; font-family:monospace; line-height:1; letter-spacing:0.05em; font-weight:bold;">\n{full_content}\n</pre>'
    elif format_mode == "markdown":
        full_content = "\n".join(output_lines)
        return f"```\n{full_content}\n```"
    else:
        return "\n".join(output_lines)

def main():
    parser = argparse.ArgumentParser(
        description="🐉 Scorch-ASCII: Transforma imágenes en Arte ASCII con la paleta de Velgrynd."
    )
    parser.add_argument("image", help="Ruta de la imagen a convertir (PNG, JPG, WEBP...)")
    parser.add_argument("-w", "--width", type=int, default=60, help="Ancho en caracteres de la salida (por defecto: 60)")
    parser.add_argument("-f", "--format", choices=["ansi", "html", "markdown", "text"], default="ansi",
                        help="Formato de salida: ansi (terminal), html (<pre>), markdown o text")
    parser.add_argument("-p", "--palette", choices=["velgrynd", "truecolor", "mono"], default="velgrynd",
                        help="Paleta de color: velgrynd (carmesí/oro/cian), truecolor (original) o mono")
    parser.add_argument("-r", "--ramp", choices=["standard", "detailed", "blocks"], default="standard",
                        help="Densidad de caracteres ASCII a usar")
    parser.add_argument("-i", "--invert", action="store_true", help="Invertir luminosidad (para fondos blancos)")
    parser.add_argument("-o", "--output", help="Guardar resultado en un archivo en lugar de imprimirlo")

    args = parser.parse_args()

    ramp_map = {
        "standard": ASCII_RAMP_STANDARD,
        "detailed": ASCII_RAMP_DETAILED,
        "blocks":   ASCII_RAMP_BLOCKS
    }
    selected_ramp = ramp_map[args.ramp]

    ascii_result = convert_image_to_ascii(
        image_path=args.image,
        width=args.width,
        ramp=selected_ramp,
        palette_mode=args.palette,
        format_mode=args.format,
        invert=args.invert
    )

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(ascii_result + "\n")
        print(f"✨ Arte ASCII guardado con éxito en '{args.output}'")
    else:
        print(ascii_result)

if __name__ == "__main__":
    main()
