#!/bin/bash
# Generate optimized web images + manifest.json from raw photos in gallery/
set -e
ROOT="/Users/dave/s/AIPlayground/LCI"
SRC="$ROOT/gallery"
FULL="$ROOT/assets/gallery/full"
THUMB="$ROOT/assets/gallery/thumb"
mkdir -p "$FULL" "$THUMB"

# Curated order: filename | caption | category
ROWS=(
"IMG_0971.jpg|Pulling fiber conduit through an open trench|Underground"
"IMG_0719.jpg|Installing HDPE conduit at a coastal crossing|Underground"
"IMG_1577.jpg|Directional drill rig working the bore pit|Drilling"
"IMG_3587.jpg|Cable-jetting equipment on the line|Fiber"
"dji_fly_20260331_074958_596_1774965084767_photo_optimized.JPG|Aerial: bore operation and spoil management|Aerial"
"56365976295__0D2B27AD-88A3-4DFB-A53B-E220A8D2D75E.JPG|Excavator pulling conduit across open ground|Underground"
"IMG_0949.jpg|Craning fiber reels onto transport|Fiber"
"IMG_1462.jpg|Setting a signal mast on a rail corridor|Rail"
"IMG_0594.JPG|Directional drilling at a resort build|Drilling"
"61514603206__68A2D986-EB98-4191-AE2F-2ABB0F9AFD96.JPG|Spooling a large-diameter fiber reel|Fiber"
"IMG_2042.JPG|Directional drill and excavator in the hills|Drilling"
"IMG_2367.jpg|Crane-set equipment on a rail siding|Rail"
"IMG_0917.jpg|Hand-digging to expose existing utilities|Underground"
"dji_fly_20260331_075044_597_1774965083252_photo_optimized.JPG|Aerial: fenced equipment compound|Aerial"
"IMG_1209.jpg|Track-side excavation along the rail line|Rail"
"IMG_2497.JPG|Heavy excavation at an oceanfront crossing|Underground"
"IMG_1453.jpg|At the controls of the directional drill|Drilling"
"IMG_1457.jpg|Drill rig staged and ready on site|Drilling"
"62267547905__00F723A8-BFE8-49D7-89ED-D60684B3DA83.JPG|Aerial: cabinet building and foundation|Aerial"
"60918887880__C82676DE-6120-4C8F-81FA-C553321D7574.JPG|Hi-rail crane truck on the line|Rail"
"60962797245__FA3E81A4-D96B-48A9-BFAA-74D134F837FD.JPG|Hi-rail service truck on the corridor|Rail"
"61161907895__E25DBDE4-8C7B-4A98-BED0-14899E94E3BE.JPG|Cable-blowing operation in the field|Fiber"
"IMG_3588.jpg|Servicing the power unit on site|Fiber"
"IMG_8506.JPG|Equipment pad survey and layout|Engineering"
"Taiban-09 Apr 2026-07-35-14 (2).JPG|Survey record at the compound build|Engineering"
"IMG_0061.JPG|Handhole vaults staged for placement|Underground"
"1000001997.JPG|Pull-box and cable vault, as-built record|Engineering"
"1000002007.JPG|Conduit fittings staged at the pad|Engineering"
"Encino_2026-04-01_14-50-23.JPG|Conduit elevation, as-built documentation|Engineering"
"Encino_2026-04-01_15-52-42.JPG|Conduit and handhole run, east elevation|Engineering"
"Encino_2026-04-02_12-52-06.JPG|Equipment foundation, as-built record|Engineering"
"IMG_0921.JPG|Equipment pad with survey overlay|Engineering"
"Tainan_2026-03-14_13-10-59.JPEG|Handholes set in the conduit trench|Underground"
"IMG_0616.JPG|Service fleet on site|Crew"
"79693964946__0E17A053-ADDA-405C-9361-C7F460C15A01.jpg|Fenced equipment site, ready for build|Engineering"
"79693969744__19507834-3BAA-4ED2-9DA7-032A5EB8648D.jpg|Trenching alongside the compound fence|Underground"
"79694250050__E7BDC56D-4373-4260-A070-D7CD83AA63E6.jpg|Access drive and gated compound|Engineering"
"IMG_1496.jpg|Signal cabinet set in the canyon|Rail"
)

MAN="$ROOT/assets/gallery/manifest.json"
echo "[" > "$MAN"
n=0
total=${#ROWS[@]}
for row in "${ROWS[@]}"; do
  n=$((n+1))
  IFS='|' read -r file cap cat <<< "$row"
  idx=$(printf "%02d" $n)
  out="photo-$idx.jpg"
  if [ ! -e "$SRC/$file" ]; then echo "MISSING: $file"; continue; fi
  sips -s format jpeg -s formatOptions 82 -Z 2000 "$SRC/$file" --out "$FULL/$out" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 72 -Z 900  "$SRC/$file" --out "$THUMB/$out" >/dev/null 2>&1
  comma=","; [ "$n" -eq "$total" ] && comma=""
  printf '  {"src":"assets/gallery/full/%s","thumb":"assets/gallery/thumb/%s","caption":"%s","cat":"%s"}%s\n' \
    "$out" "$out" "$cap" "$cat" "$comma" >> "$MAN"
done
echo "]" >> "$MAN"
echo "Generated $n images. Manifest: $MAN"
du -sh "$FULL" "$THUMB"
