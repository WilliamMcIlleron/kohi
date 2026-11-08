"""Self-host the two typefaces.

Pulls the exact woff2 slices Google would serve, clamps the weight axis to the
range the design actually uses, and subsets the glyph set down to Latin plus the
handful of extended characters the copy needs (Kōhī, café, em dashes, quotes).
Emits a plain @font-face stylesheet. Run once; there is no build step.
"""
import io, os, re, urllib.request

ROOT = r"C:/Users/weebm/OneDrive/Desktop/Projects/kohi"
OUT = os.path.join(ROOT, "assets", "fonts")
os.makedirs(OUT, exist_ok=True)

CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Fraunces:ital,opsz,wght@0,9..144,300..400;1,9..144,300..400"
    "&family=Inter:wght@400..500&display=swap"
)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

# What the copy can plausibly contain: ASCII, Latin-1 accents, smart
# punctuation, plus the macron vowels in "Kōhī".
LATIN = (
    list(range(0x20, 0x7F)) + [0xA0, 0xA9, 0xAE, 0xB0, 0xB7, 0xBB, 0xAB]
    + list(range(0xC0, 0x100))
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2039, 0x203A, 0x20AC]
)
EXT = [0x100, 0x101, 0x12A, 0x12B, 0x14C, 0x14D, 0x152, 0x153,
       0x160, 0x161, 0x178, 0x17D, 0x17E, 0x2044]


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read() if binary else r.read().decode("utf-8")


css = get(CSS_URL)
blocks = re.findall(r"/\*\s*([\w\[\]-]+)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)

faces = []
for subset, body in blocks:
    if subset not in ("latin", "latin-ext"):
        continue
    faces.append(dict(
        fam=re.search(r"font-family:\s*'([^']+)'", body).group(1),
        style=re.search(r"font-style:\s*(\w+)", body).group(1),
        subset=subset,
        url=re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1),
    ))

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter, Options

rules, before, after = [], 0, 0

for f in faces:
    raw = get(f["url"], binary=True)
    before += len(raw)

    font = TTFont(io.BytesIO(raw))
    have = set(font.getBestCmap())

    wanted = sorted(set(EXT if f["subset"] == "latin-ext" else LATIN) & have)
    if not wanted:
        print(f"skip {f['fam']} {f['style']} {f['subset']} — no needed glyphs")
        continue

    axes = {a.axisTag for a in font["fvar"].axes} if "fvar" in font else set()
    if "wght" in axes:
        font = instancer.instantiateVariableFont(
            font, {"wght": (300, 400) if f["fam"] == "Fraunces" else (400, 500)},
            updateFontNames=False)

    opts = Options()
    opts.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "rlig"]
    opts.name_IDs = [1, 2, 3, 4, 6]
    opts.drop_tables += ["DSIG"]
    opts.notdef_outline = False
    sub = Subsetter(options=opts)
    sub.populate(unicodes=wanted)
    sub.subset(font)

    slug = (f["fam"].lower() + ("-italic" if f["style"] == "italic" else "")
            + "-" + f["subset"])
    path = os.path.join(OUT, slug + ".woff2")
    font.flavor = "woff2"
    font.save(path)

    size = os.path.getsize(path)
    after += size
    print(f"{slug:30s} {len(raw)//1024:3d}KB -> {size/1024:6.1f}KB  ({len(wanted)} glyphs)")

    urange = ", ".join(f"U+{c:04X}" for c in wanted)
    rules.append(
        "@font-face {\n"
        f"  font-family: '{f['fam']}';\n"
        f"  font-style: {f['style']};\n"
        f"  font-weight: {'300 400' if f['fam'] == 'Fraunces' else '400 500'};\n"
        "  font-display: swap;\n"
        f"  src: url('/assets/fonts/{slug}.woff2') format('woff2');\n"
        f"  unicode-range: {urange};\n"
        "}"
    )

header = ("/* Self-hosted, weight-clamped, glyph-subset copies of Fraunces and Inter.\n"
          "   Generated once by tools/build-fonts.py — there is no build step.\n"
          "   Re-run that script if the copy ever needs characters outside these ranges. */\n\n")
io.open(os.path.join(ROOT, "assets", "css", "fonts.css"), "w", encoding="utf-8").write(
    header + "\n\n".join(rules) + "\n")

print(f"\nTOTAL {before/1024:.0f}KB -> {after/1024:.1f}KB")
