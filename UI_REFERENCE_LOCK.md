# RealmOS UI Reference Lock v1.4

Status: locked reference package.

## Important Distinction

This package contains two types of UI references:

1. **Full-size page screenshots**
   - Location: `assets/ui-references/01_core_pages_clean/`
   - Use these as the strongest visual references for shell, spacing, color, density, sidebar, cards, and typography.

2. **Master coverage board**
   - Location: `assets/ui-references/00_master_boards/full_ui_coverage_master_board_v1.png`
   - Use this as a coverage map for missing pages, overlays, states, and detail screens.
   - Do not treat the small thumbnails inside the board as pixel-perfect final screenshots.

3. **Reference slices**
   - Location: `assets/ui-references/04_reference_slices_from_master_board/`
   - These are cropped sections from the master board for easier IDE navigation.
   - They are planning/design references, not final full-size screens.

## Locked Visual Rules

All future UI screens must follow the clean RealmOS visual direction:

- dark navy / charcoal background
- restrained blue and purple accents
- soft card borders
- consistent left sidebar
- consistent top command bar
- clean card spacing
- not too busy
- readable typography
- enterprise dashboard layout
- no random redesign between pages
- no excessive neon
- no game UI inside MVP admin screens
- world/game-like visuals only inside future world layer screens

## Cursor Rule

When implementing UI, Cursor should open these first:

```text
UI_MOCKUPS_INDEX.md
UI_REFERENCE_ORGANIZATION.md
assets/ui-references/01_core_pages_clean/
assets/ui-references/00_master_boards/full_ui_coverage_master_board_v1.png
```

Then use the specific folder for the feature being implemented.
