#!/usr/bin/env bash
# Re-encode the 4K vertical reels down to web-appropriate sizes.
# Sources are never modified; everything lands in assets/video/.
set -u
cd "C:/Users/weebm/OneDrive/Desktop/Projects/kohi" || exit 1
mkdir -p assets/video

# Silent, short, heavily compressed hero loop cut from the vinyl reel.
ffmpeg -hide_banner -loglevel error -y -ss 2.5 -t 7 -i images/reels/7.mp4 \
  -vf "scale=-2:1280:flags=lanczos" \
  -an -c:v libx264 -preset slow -crf 30 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart assets/video/hero-loop.mp4 </dev/null
echo "hero-loop done: $(du -h assets/video/hero-loop.mp4 | cut -f1)"

# Gallery reels: 720x1280 max, keep audio (the music is the point).
MAP="
1|reel-01
2|reel-02
3|reel-03
4|reel-04
5|reel-05
6|reel-06
7|vinyl
8|reel-08
9|reel-09
10|reel-10
Everyday_Cozy_People|espresso
Kohi_Vibes|japan-style
Timeline_1|shelf
Kohi_Valen1|valentines
video20|reel-20
video21|reel-21
video22|reel-22
video23|reel-23
video24|reel-24
video25|reel-25
"

echo "$MAP" | while IFS='|' read -r src slug; do
  [ -z "${src:-}" ] && continue
  in="images/reels/${src}.mp4"
  [ ! -f "$in" ] && { echo "MISSING $in"; continue; }
  out="assets/video/${slug}.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$in" \
    -vf "scale='min(720,iw)':-2:flags=lanczos" \
    -c:v libx264 -preset medium -crf 30 -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 96k -ac 2 \
    -movflags +faststart "$out" </dev/null
  before=$(du -k "$in" | cut -f1); after=$(du -k "$out" | cut -f1)
  echo "ok ${slug}: ${before}KB -> ${after}KB"
done

echo "=== DONE VIDEO ==="
du -sh assets/video
