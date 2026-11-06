# CONNETIX UAE — Shopify theme

Bilingual (English + Arabic, RTL) storefront theme for the CONNETIX Tiles UAE store build.

- **Base:** [Shopify Horizon](https://github.com/Shopify/horizon) 4.4.0 (first commit is the unmodified base).
- **Custom layer:** everything prefixed `px-` (tokens, base styles, Arabic font, custom blocks), plus small, commented edits to Horizon files.
- **Sync:** connected to the Shopify store through the Shopify GitHub integration as an **unpublished** theme. The live theme is not touched.

## What's in the px layer

| File | Purpose |
|---|---|
| `snippets/px-head.liquid` | Loads the px stylesheets; declares the self-hosted Arabic font ("PX Arabic") and puts it first in every font stack |
| `assets/px-tokens.css` | Brand colours, shape, spacing and motion tokens; range "colour worlds" via `data-range` |
| `assets/px-base.css` | Arabic typography (line height, no letter-spacing), focus ring, RTL helpers, chips, preview label |
| `assets/px-rubik-arabic.woff2` | Rubik variable font, Arabic subset (SIL OFL 1.1, see `FONT-LICENSE-Rubik-OFL.txt`) |
| `assets/px-ph-*.webp` | Original placeholder product illustrations (no brand photography). Replace with brand-approved images |
| `locales/*.json` → `px.*` | Wordmark, shape names, range names, labels (EN + AR) |

Edits to Horizon files (search for `px`): `layout/theme.liquid`, `blocks/_header-logo.liquid`, `config/settings_schema.json` (CONNETIX UAE settings group), `config/settings_data.json`, `sections/header-group.json`.

## Rules

- Custom CSS uses **logical properties** only (`margin-inline-start`, `inset-inline-end`, …) so it works in both directions.
- Brand values are **proposals** pending brand guidelines; text/background pairs are checked for WCAG AA.
- Arabic strings are **machine-drafted and pending qualified human review** before launch.
- Placeholder content (products, prices, images, warnings) must be replaced with brand-approved content before launch.
