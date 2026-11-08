#!/usr/bin/env bash
# Generate responsive WebP derivatives from the original photography.
# Sources are never modified; everything lands in assets/img/.
set -u
cd "C:/Users/weebm/OneDrive/Desktop/Projects/kohi" || exit 1
mkdir -p assets/img

# src|slug  -- slug becomes assets/img/<slug>-<width>.webp
MAP="
images/image20.jpg|counter-noren
images/image7.jpeg|guests
images/image8.jpeg|matcha-iced
images/image1.jpeg|iced-coffee
images/image11.jpeg|matcha-latte
images/image13.jpeg|two-cups
images/image17.jpeg|cake-latte
images/image9.jpeg|pour
images/7.png|vinyl
images/sessions1.png|turntable
images/sessions4.png|selector
images/sessions5.png|decks
images/sessions2.png|sessions-crowd
images/sessions3.png|sessions-room
images/everydaycozy.png|espresso
images/kohivibes.png|japan-style
images/timeline.png|shelf
images/valen1.png|valentines
images/1.png|reel-01
images/2.png|reel-02
images/3.png|reel-03
images/4.png|reel-04
images/5.png|reel-05
images/6.png|reel-06
images/8.png|reel-08
images/9.png|reel-09
images/10.png|reel-10
images/video20.png|reel-20
images/video21.png|reel-21
images/video22.png|reel-22
images/video23.png|reel-23
images/video24.png|reel-24
images/video25.png|reel-25
"

WIDTHS="480 800 1200 1800"

echo "$MAP" | while IFS='|' read -r src slug; do
  [ -z "${src:-}" ] && continue
  [ ! -f "$src" ] && { echo "MISSING $src"; continue; }
  # real (post-rotation) width
  sw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src")
  for w in $WIDTHS; do
    if [ "$w" -gt "$sw" ]; then continue; fi
    out="assets/img/${slug}-${w}.webp"
    ffmpeg -hide_banner -loglevel error -y -i "$src" \
      -vf "scale=${w}:-2:flags=lanczos" \
      -c:v libwebp -quality 78 -compression_level 6 -preset photo \
      "$out" </dev/null
  done
  # always emit a full-size-capped variant if source is smaller than 800
  if [ "$sw" -lt 800 ]; then
    ffmpeg -hide_banner -loglevel error -y -i "$src" \
      -vf "scale=${sw}:-2:flags=lanczos" \
      -c:v libwebp -quality 82 -compression_level 6 -preset photo \
      "assets/img/${slug}-${sw}.webp" </dev/null
  fi
  echo "ok $slug (src ${sw}px)"
done

echo "=== DONE IMAGES ==="
du -sh assets/img
