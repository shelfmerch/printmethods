/**
 * Legacy typo entrypoint: `DesinEditor`.
 *
 * This file historically diverged from the canonical design editor and was a
 * frequent source of merge conflicts during route/import migrations.
 *
 * It now re-exports the canonical Design Editor implementation from the feature
 * module to keep behavior consistent.
 */
export { default } from "@/modules/design-editor/DesignEditorPage";