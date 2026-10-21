# Chibi poses: prompt kit

The ImJustLucas chibi was commissioned from an artist. New poses are generated with Nano Banana (Gemini), always with the high-resolution commissioned art (2000x2000) attached as the reference. A pose ships only if it looks like the same artist drew it and Lucas approves it.

## How to generate a pose

1. Attach the commissioned reference image. Once a pose is approved, attach it too: two references hold the body proportions better than the head alone.
2. Paste the **base prompt**, then the **pose line** for the pose you want.
3. Ask for a PNG on pure white. Background removal (transparent WebP) happens after approval.
4. Never attach an earlier generated test that already looks like the target: the model returns it unchanged instead of drawing a new image.
5. Describe left and right as sides of the image, not of his body ("the hand on the right of the image"): "his right hand" makes the model mirror the whole character. A mirrored result that is otherwise good can simply be flipped horizontally.

## Base prompt (identical for every pose)

```
Using the attached image as the exact character and style reference, draw the same character as a full-body chibi, about two and a half heads tall: big head, short body, small rounded hands and feet.

Keep everything that makes him recognisable identical to the reference: curly honey-blond hair with cream highlights and the small curl on top, big teal-blue eyes with a white cloud-shaped highlight, light peach skin with pink ear shading and the two small white highlight dots on the cheek, a big happy open-mouth smile.

Keep the art style identical too: hand-drawn dark maroon outline (#6b1d1d) with visibly varying line weight, thicker on the outer silhouette; strictly flat cel shading with two tones per colour, no soft gradients and no airbrush, on the clothes as much as on the skin.

Plain pure white background, no floor shadow, no text, no border, centred, the whole body visible with margin around it, square 2000x2000, PNG.
```

## Outfits

Each pose gets its own outfit, matched to the activity, so the poses read as moments of his life rather than one costume. The face, hair, line and shading never change.

- Outfits may pick up the site's colours: plum (#3b2159), tangerine (#ff8a3d), violet (#b47cff), sky blue (#46c2ff), gold (#ffd84d), always as flat colours.
- When the outfit is not the checker shirt of the reference, the prompt says so explicitly ("Do not copy the shirt from the reference"), otherwise the model copies it.
- No real brand logos on clothes or objects.

## Pose lines

Shell and states:
- **Banner (home)**: `Standing in a relaxed three-quarter pose, turned towards the viewer's right exactly like the reference (his visible ear on the left of the image), waving with the hand on the right of the image raised. He wears an oversized, slightly cropped long-sleeve Breton-stripe t-shirt (off-white with even navy-blue horizontal stripes that wrap around the body and the sleeves, drop shoulders, loose raw-edge cuffs, no logo or print), very baggy black wide-leg jeans stacking over the shoes, white sneakers, over-ear headphones resting around his neck. One small yellow four-point sparkle near his raised hand.`
- **Chilling (no ongoing job)**: `Lounging back in a big round tangerine (#ff8a3d) beanbag, hands behind his head, legs crossed, eyes half closed and a lazy, content smile. The Breton longsleeve of the banner, very baggy black wide-leg jeans, white sneakers.`
- **Sleeping (offline)**: `Curled up asleep on his side on a big plump plum (#3b2159) cushion, his head on the left of the image resting on his folded hands, his face still turned towards the viewer in three-quarter view, eyes closed, a tiny peaceful smile, his curls a little messy. He wears a very oversized, chunky, soft crewneck pullover in a light misty lilac-white (#ece6f3), with a few small electric-blue (#2f6bff) touches: the collar rib, the cuff ribs and a tiny four-point sparkle stitched on the chest; loose charcoal joggers and white socks. Three small hand-drawn yellow "z" shapes float above his head, the only lettering in the image.`
- **Waving goodbye (page close)**: `Walking away towards the right of the image, seen from three-quarter back, turning his head back over his shoulder towards the viewer with a big warm smile, waving goodbye with the hand on the left of the image raised high. Lucas's own puffer jacket: an oversized matte black puffer with a high stand-up collar, wide horizontal quilted baffles, a front zip, elastic cuffs and small drawcord toggles at the hem, printed with a few large simple white flowers (five rounded petals around a small irregular black centre) scattered across the chest, the sides, the back and the sleeves; no label or logo. Very baggy black wide-leg jeans, white sneakers.`
- **Trophy (MDF 2025)**: `Holding a big gold trophy up with both hands, eyes closed in a proud grin, a few yellow four-point sparkles around the trophy. The checker camp-collar shirt from the reference and dark jeans.`

Hobbies:
- **Surf**: `Carrying a surfboard under his arm, wet hair, barefoot. Short-sleeve wetsuit top in plum with a tangerine stripe, sky blue board shorts. The surfboard is white with a gold stripe.`
- **Skate**: `Carving on a skateboard that rolls towards the right of the image, the board level and parallel to the bottom edge, both feet on the deck, knees bent, body leaning into the turn, front arm reaching forward and back arm behind for balance, head turned and slightly tilted to look ahead where he is rolling (still the three-quarter face of the reference), a big happy open-mouth smile, his curls blown back by the wind. Oversized washed black hoodie (charcoal #2b2b30 with a few lighter faded patches in #4a4a52 drawn as flat shapes), very baggy washed dark-blue wide-leg jeans (#2c3e5c with flat lighter faded patches in #4a5f80 on the thighs and knees), white skate shoes. A plain street skateboard: black grip tape, plum (#3b2159) deck edge, tangerine (#ff8a3d) wheels, exactly four wheels. No hat, so his hair stays fully visible.`
- **Playing LoL**: `Celebrating a win: standing, the fist on the right of the image pumped up in the air and the other hand holding the side of the over-ear gaming headset on his head, eyes squeezed shut in a huge open-mouth grin. The Breton-stripe longsleeve of the banner (stripes wrapping around each sleeve and bending with the folds of the raised arms), very baggy black wide-leg jeans, white sneakers. Three small yellow four-point sparkles around the raised fist. No game logo anywhere.`
- **Coding**: `Sitting cross-legged on the floor, seen in three-quarter view turned towards the right of the image, a laptop resting on his lap with its screen facing him, typing with both hands, a focused happy smile with the tip of his tongue poking out. The laptop is plain silver with no logo; the back of its lid, facing the viewer, carries one small sticker of a yellow four-point sparkle. Oversized charcoal overshirt open over a plum (#3b2159) t-shirt, very baggy black wide-leg jeans, white sneakers.`
- **Coffee**: `Holding a steaming mug with both hands close to the viewer, eyes closed, savouring it. Cosy cream knit sweater with a tangerine scarf.`
- **Series**: `Sitting on the big plum (#3b2159) cushion of the sleeping pose, wrapped in a soft violet (#b47cff) blanket over his shoulders, holding a tangerine (#ff8a3d) bowl of popcorn in his lap, one piece of popcorn halfway to his mouth, looking towards the right of the image at a screen we do not see, wide amused eyes and an open-mouth laugh. Under the blanket he wears the night outfit: the light misty lilac-white chunky pullover with electric-blue (#2f6bff) rib collar and cuffs, charcoal joggers, white socks.`
- **Music**: `Standing in a three-quarter view turned towards the right of the image, eyes closed, head tilted to the side and nodding to the beat, a dreamy open-mouth smile as if singing along. The same dark over-ear headphones as the banner sit on his head, one hand pressing an ear cup, the other hand raised snapping its fingers. Oversized washed sky-blue t-shirt (#8fb8d8 with a few flat lighter faded patches) over a white long-sleeve, very baggy washed dark-blue jeans, white sneakers. Two small yellow music notes float near his head.`

## First test (2026-10-20, banner pose)

Face, hair, eyes, colours and outline colour match the reference closely, and the headphones and sparkle work. What gave it away as generated, and what the base prompt now asks for: the line weight is more uniform than the artist's, the jeans and shirt use soft gradients instead of flat cel shading, and the body is about three and a half heads tall, so it reads less chibi and a bit stiff.

## Second test (2026-10-20, banner pose in a Breton-stripe longsleeve)

Approved by Lucas after a horizontal flip (`.impeccable/mocks/chibi/banner-wave-flipped.png`): about two and a half heads tall, flatter shading, livelier line, and the face reads as the commissioned character. The prompt asked for "his right hand", so the model mirrored him; the pose line now names sides of the image instead.

## Tattoos (2026-10-20)

Optional add-on line, appended to a pose prompt only when wanted:

```
The back of his right hand, shown large and close to the viewer, carries three small tattoos drawn with the same dark maroon outline as the rest of the drawing and following the shape of the hand: three tiny dots in a vertical line on the index finger, a small smiley face on the middle finger, and two outlined four-point sparkle stars on the back of the hand near the thumb, the lower one slightly bigger.
```


Lucas has three tattoos on the back of his right hand: three dots in a line on the index finger, a smiley on the middle finger, and two outlined four-point sparkles near the thumb. They are optional, a later variant of a pose already approved without them, and only where the hand is drawn large enough to carry them: the coffee, LoL and music poses, never the full-body banner. A first try on the banner (2026-10-20) looked pasted on: lines thinner and greyer than the outline, flat on a mitten-shaped hand, and invisible at the size the banner is shown on the site.

The outlined four-point sparkle of the tattoo is also the site's sparkle motif (DESIGN.md, Shapes).

## Coffee pose (2026-10-20)

Approved by Lucas on the first try (`.impeccable/mocks/chibi/coffee.png`), with the commissioned art and the approved banner attached. The orientation came out right because the prompt named the sides of the image, the closed-eye smile keeps him recognisable, and the tangerine scarf and plum mug sit in the site's palette. A one-line edit in the same Gemini conversation moved the scarf ends to the front (`.impeccable/mocks/chibi/coffee-scarf-front.png`); Lucas likes both. The scarf-in-front version is the default for the site: its silhouette stays clean once the background is removed and at small sizes; the cape version stays as an alternate.

## Skate pose (2026-10-20)

Approved by Lucas (`.impeccable/mocks/chibi/skate.png`): washed black hoodie with a few faded areas on the shoulders, washed dark-blue baggy jeans, front arm pointing the way. A first violet-hoodie version was dropped. Two lessons: faded clothes must be asked as a few small flat lighter areas, or they turn into camouflage; and re-running a prompt in the same conversation keeps the previous pose, so a new pose always needs a new conversation. Known limit: he stands facing the viewer with both feet pointing forward, not sideways like a real skater; a side-stance variant tried in a fresh conversation did not work, so the front-facing pose stays.

## Edits within one conversation (2026-10-20)

Two or three outfit edits in a row are fine, but each one redraws the whole image and the drift adds up. For a fourth change, start a new conversation from the best earlier version of the pose. Whenever the Breton longsleeve is drawn with raised arms, say explicitly that the stripes wrap around the sleeves: otherwise they run along the length of the raised sleeve. The cropped hem showing a little skin when the arms go up is fine (Lucas).

## LoL pose and the day/night wardrobe (2026-10-20)

Approved by Lucas in two outfits: day, the Breton longsleeve with the cropped hem (`.impeccable/mocks/chibi/lol-day.png`), and night, the first "pyjama" result: grey hoodie with tangerine drawstrings, grey joggers, white socks, plum slides (`.impeccable/mocks/chibi/lol-night.png`). On both, the stripes of the raised arm still run along the sleeve; accepted, it hardly shows at site size. The banner and LoL poses follow Lucas's time in Paris (DESIGN.md); the banner still needs its night version.

## Sleeping pose (2026-10-20)

Approved by Lucas on the first try (`.impeccable/mocks/chibi/sleeping.png`): curled up on the plum cushion in the light lilac-white chunky pullover with electric-blue ribs and two small stitched sparkles, charcoal joggers, white socks. The small curl on top of the head is missing; accepted, it hardly shows at presence-card size. Lucas likes this pullover a lot.

## Night outfit (2026-10-20)

The sleeping pose's pullover replaces the grey hoodie as the night outfit for the banner and LoL poses: light misty lilac-white chunky crewneck with electric-blue (#2f6bff) rib collar and cuffs and two small stitched sparkles, charcoal joggers, white socks.

## LoL night and music (2026-10-20)

- LoL night redone with the night pullover by an outfit edit (`.impeccable/mocks/chibi/lol-night.png`); the grey-hoodie version is kept as `lol-night-hoodie.png`. Gemini stitched three sparkles instead of two; accepted.
- Music approved on the first try (`.impeccable/mocks/chibi/music.png`): eyes closed, singing along, hand on the ear cup, washed sky-blue tee over a white long-sleeve, washed dark-blue jeans, two music notes. Lucas's favourite so far. It also serves the "listening" presence state.

## Animation frames

A second frame is an edit of the approved pose in its own Gemini conversation: same framing, size and position, only a small change. Frames alternate in steps (DESIGN.md, Motion and Sound). Legs and feet stay identical so the frames register; small offsets are realigned by hand before use.

## Trophy and the first animation frame (2026-10-20)

- Trophy approved (`.impeccable/mocks/chibi/trophy.png`): the commissioned checker shirt, a plain gold cup held up in one hand (the prompt asked for both), teeth-out grin, sparkles. It goes in the MDF 2025 achievement slot.
- Music frame B (`.impeccable/mocks/chibi/music-frame-b.png`): an edit of the music pose with a round "oh" mouth and snapped fingers. Legs and feet register exactly with frame A (measured offset 0,0), so no realignment is needed. Gemini kept the head tilt and the notes where they were, so the loop moves only the mouth and the hand.

## Coding pose (2026-10-20)

Approved: cross-legged with the laptop, tongue out, two sparkle stickers on the lid. Two outfits kept: the Breton longsleeve with baggy black jeans is the default (`.impeccable/mocks/chibi/coding.png`, an outfit edit where the stripes did wrap around the bent sleeves), and the charcoal overshirt over a plum tee is the alternate (`coding-overshirt.png`).

## Surf pose (2026-10-20)

Approved on the first try (`.impeccable/mocks/chibi/surf.png`): damp curls with water drops that keep the curl on top, a clean shaka, plum wetsuit top with a tangerine stripe, sky-blue board shorts, white board with a gold stripe. The board is held diagonally behind him rather than under the arm; accepted.

## Series and chilling poses (2026-10-20)

- Series approved (`.impeccable/mocks/chibi/series.png`): on the plum cushion of the sleeping pose, violet blanket over the night pullover, tangerine popcorn bowl, laughing towards a screen on the right. The day/evening pair of seats is a motif: plum cushion at night, tangerine beanbag by day.
- Chilling approved (`.impeccable/mocks/chibi/chilling.png`): lounging in the tangerine beanbag in the Breton longsleeve, hands behind the head, half-closed eyes and a lazy smile. The stripes wrapped correctly around the bent arms. Legs are crossed at the knees rather than the ankles; accepted.

## Goodbye pose (2026-10-20)

Kept (`.impeccable/mocks/chibi/goodbye.png`): walking away, head turned back with a big smile, waving, in Lucas's black puffer with white flowers; the backpack was removed by an edit. The flowers came out smaller, more numerous and more daisy-like than on the real jacket (a few large rounded blobs); an edit can fix that if Lucas wants.

## New poses from Lucas (2026-10-21)

Lucas provided more poses with their backgrounds already removed (2048px PNG), exported to 1024px WebP like the others:
- **Football** (`football.webp`, a Hobby): juggling a ball on his knee in a navy and red kit.
- **Tennis** (`tennis.webp`, a Hobby): a forehand, headband, white polo and navy shorts.
- **Ollie** (`skate-ollie.webp`): the skate outfit seen side-on, the board tipped up towards the right of the image. It is the jump frame of the Ollie cabinet in the Arcade; the skate pose is its rolling frame.
- **Christmas** (`banner-noel.webp`): the banner wave in a Santa hat; the banner's resting pose all December, by Lucas's time in Paris.
- **Santa** (`santa.webp`): in a Santa suit with a sack and a present; joins the boop poses in December.

Not added, as they repeat poses already on the site: `classic` (the banner), `coffee_1`/`coffee_2` (the coffee pose and a variant with a bag), `listening`/`listening_2` (the music frames), `playing_day`/`playing-night_2` (LoL day and night), `playing_night` (the grey-hoodie LoL night, kept as `lol-night-hoodie.png`), `sleep`, `surfing`, `winning` (the trophy), `working` (coding), and the `pfp` busts.

## Surf cabinet poses (to generate)

The Surf cabinet of the Arcade is a Flappy-style game: a tap lifts Lucas off the swell, gravity brings him back. It needs two poses in the surf outfit, each in its own new conversation, with the commissioned art and the approved surf pose attached, after the base prompt:

- **Riding**: `Standing on his white surfboard with a gold stripe, riding towards the right of the image, the board level and parallel to the bottom edge, knees bent in a low surf stance, arms spread for balance, the front hand pointing forward, a big happy open-mouth smile, wet curls with a few water drops. Plum (#3b2159) short-sleeve wetsuit top with a tangerine (#ff8a3d) stripe, sky-blue board shorts, barefoot. A small white spray of water behind the tail of the board, drawn in the same flat style; no sea and no wave, only the spray.`
- **Wipeout**: `Falling off his white surfboard with a gold stripe: the board flipped up behind him on the left of the image, Lucas tumbling forward towards the right of the image, arms flailing, eyes squeezed shut and mouth open in a funny "whoa" face, wet curls flying, a few water drops and a small white splash around him, drawn in the same flat style. Same plum wetsuit top with the tangerine stripe and sky-blue board shorts, barefoot. No sea and no wave.`

Keep both on pure white, square, the whole body and board visible with margin. Once approved, they become the `surf-ride` and `surf-wipeout` poses and the cabinet's `status` turns `playable` in `lib/arcade/cabinets.ts`.
