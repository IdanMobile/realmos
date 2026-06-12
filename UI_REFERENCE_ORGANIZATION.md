# UI Reference Organization

## Folder Map

```text
assets/ui-references/
  00_master_boards/
    full_ui_coverage_master_board_v1.png

  01_core_pages_clean/
    overview/
    realms/
    tasks/
    runs/
    agents/
    communication_archive/
    memory/
    artifacts/
    decisions/
    errors/
    audit_logs/

  02_communication/
    thread_detail_full/
    communications_dashboard/
    archive_analytics/

  03_existing_high_detail/
    overview/
    realms/
    tasks/
    runs/
    agents/
    memory/
    artifacts/
    decisions/
    errors/
    audit/

  04_reference_slices_from_master_board/
    01_core_pages_overview_strip.png
    02_missing_core_pages_strip.png
    03_communications_system_strip.png
    04_detail_pages_strip.png
    05_creation_edit_flows_strip.png
    06_system_intelligence_strip.png
    07_global_overlays_drawers_strip.png
    08_page_states_and_design_system_strip.png
    09_world_future_layer_strip.png
    10_mobile_auth_onboarding_strip.png

  05_generation_specs/
    missing_ui_generation_batches.md
    ui_generation_prompt_template.md
```

## How to Use

### Building a core page

Use `01_core_pages_clean` first.

### Building communication flows

Use:
- `02_communication`
- master board section `03_communications_system_strip.png`

### Building a missing detail page or modal

Use:
- `00_master_boards/full_ui_coverage_master_board_v1.png`
- the relevant strip in `04_reference_slices_from_master_board`
- the closest full-size clean page for shell/style consistency

### Do not

Do not redesign sidebar, top bar, card style, color language, or density.
