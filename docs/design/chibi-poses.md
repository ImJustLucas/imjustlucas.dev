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
- **Banner (home)**: `Standing in a relaxed three-quarter pose, turned towards the viewer's right exactly like the reference (his visible ear on the left of the image), waving with the hand on the right of the image raised. He wears an oversized, slightly cropped long-sleeve Breton-stripe t-shirt (off-white with even navy-blue horizontal stripes, drop shoulders, loose raw-edge cuffs, no logo or print), very baggy black wide-leg jeans stacking over the shoes, white sneakers, over-ear headphones resting around his neck. One small yellow four-point sparkle near his raised hand.`
- **Chilling (no ongoing job)**: `Leaning back in a beanbag, hands behind his head, eyes half closed with a content smile. Oversized plum hoodie, grey joggers, white socks.`
- **Sleeping (offline)**: `Curled up asleep on a small cloud-shaped pillow, a little "z" above his head. Tangerine pyjama shirt.`
- **Waving goodbye (page close)**: `Seen from three-quarter back, turning his head to wave goodbye over his shoulder, backpack on. Sky blue zip jacket, dark jeans, white sneakers.`
- **Trophy (MDF 2025)**: `Holding a big gold trophy up with both hands, eyes closed in a proud grin, a few yellow four-point sparkles around the trophy. The checker camp-collar shirt from the reference and dark jeans.`

Hobbies:
- **Surf**: `Carrying a surfboard under his arm, wet hair, barefoot. Short-sleeve wetsuit top in plum with a tangerine stripe, sky blue board shorts. The surfboard is white with a gold stripe.`
- **Skate**: `Riding a skateboard mid-push, arms out for balance. Violet hoodie, grey beanie, loose dark jeans, white skate shoes.`
- **Playing LoL**: `Sitting cross-legged with a gaming controller, focused and grinning, over-ear headset on his head. Black hoodie with a tangerine drawstring, grey joggers.`
- **Coding**: `Sitting with a laptop on his lap, typing, a small happy smile. Grey overshirt open over a plum t-shirt, dark jeans.`
- **Coffee**: `Holding a steaming mug with both hands close to the viewer, eyes closed, savouring it. Cosy cream knit sweater with a tangerine scarf.`
- **Series**: `Sitting wrapped in a violet blanket with a bowl of popcorn, looking at something off-screen with wide amused eyes. Grey hoodie under the blanket.`
- **Music**: `Eyes closed, head tilted, nodding to the beat, over-ear headphones on his head and one hand holding them. Sky blue t-shirt, dark jeans.`

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

Approved by Lucas on the first try (`.impeccable/mocks/chibi/coffee.png`), with the commissioned art and the approved banner attached. The orientation came out right because the prompt named the sides of the image, the closed-eye smile keeps him recognisable, and the tangerine scarf and plum mug sit in the site's palette. One small flaw if it is ever redone: the scarf hangs behind his back like a cape.
