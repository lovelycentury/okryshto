export * from "./colors";
export * from "./typography";
export * from "./scales";
export * from "./effects";
export * from "./content";

/** Namespace prefix for everything the plugin creates (used for idempotent teardown). */
export const NS = "Vizitka";

/** Page name prefix marker so we can find & wipe prior generated pages. */
export const PAGE_MARK = "◆";
