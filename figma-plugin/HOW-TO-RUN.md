# How to run the Enlista Voice Posts Figma plugin

## What it creates
13 fully editable frames on a new Figma page called "🎤 Voice Feature Posts":
- **Post 21** — You Spoke. We Wrote. (input → output transformation)
- **Post 22** — Every Detail Captured (voice → parsed fields grid)
- **Post 23** — Type Nothing. Publish Everything. (before/after split)
- **Carousel 21** — 4 Properties, 4 Voice Inputs (5 slides)
- **Carousel 22** — What Our Voice AI Listens For (5 slides)

## Steps

1. Open Figma (desktop app — plugin API doesn't work in browser)
2. Open any Figma file (or create a new one)
3. Go to **Plugins → Development → Import plugin from manifest...**
4. Navigate to `ListingAI/figma-plugin/` and select `manifest.json`
5. Go to **Plugins → Development → Enlista Voice Feature Posts → Run**
6. Wait ~5 seconds — all 13 frames appear on a new page

## After it runs

Every element is natively editable:
- **Double-click any text** to edit it inline
- **Click any colour swatch** in the Fill panel to change colours
- **Drag handles** to resize cards, adjust spacing
- **Select + copy** any frame to duplicate and modify
- Export individual frames as PNG at 2x or 3x for Instagram

## Fonts
The plugin uses **Inter** (always available in Figma). If you want to switch to
Satoshi (the brand font), select all text in a frame and change the font family
in the right panel — the weights (Bold, Extra Bold, etc.) map directly.

## Notes
- The plugin is safe to run multiple times — it creates a new page each time
- After running, you can delete the plugin from Development if you don't need it again
