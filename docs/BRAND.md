# Jailau — mobile brand system

Jailau connects people travelling between Shymkent and nearby villages. The
interface should feel like a reliable road between familiar places: calm,
practical, open, and local. It is not an urban taxi or delivery brand.

## Palette

| Role | Color | Use |
|---|---|---|
| Base | `#0E0E0E` | Page and app background |
| Primary | `#2E7D32` | Main actions and active line |
| Natural light | `#72B36D` | Focus/active accents and icon strokes |
| Sand | `#D6C29C` | Contact emphasis and warm secondary actions |
| Text | `#FFFFFF` | Primary content and headings |
| Secondary text | `#BDBDBD` | Supporting copy |

Cards use a quiet `#191C19` surface with a simple border. Keep shadows flat or
absent. Avoid neon greens, decorative gradients, heavy illustrations, and large
blocks of marketing copy.

## Type and layout

- Manrope variable (200–800), bundled in `fonts/` under SIL OFL 1.1. Headings
  use ExtraBold (800); body uses Regular/Medium (400/500).
- The official Manrope file lacks some Kazakh letters. The CSS stack falls back
  to device Noto Sans or system sans for missing glyphs. Never let them render
  as empty boxes; verify on target Android devices before launch.
- Left-align headings and content. Use one clear primary action per screen,
  generous spacing, legible status labels, and mobile controls at least 48 px high.
- Two route tiles: village → Shymkent uses the city icon; Shymkent → village
  uses the yurt icon. The existing Jailau landscape logo remains unchanged.
- All meaningful messages and empty states must exist in both Russian and Kazakh.

## Interaction language

Use short, honest verbs: “Предложить поездку”, “Подтвердить”, “Отказаться”,
“Сменить район”. Keep timing and access visible: 10 minutes on line, passenger
agreement before contacts, and admin reapproval after changing district.
