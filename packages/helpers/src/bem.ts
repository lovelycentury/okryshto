/**
 * Build BEM class names for a given block.
 *
 * @example
 * const button = bem("lokki-button");
 * button();                       // "lokki-button"
 * button("label");                // "lokki-button__label"
 * button(null, "primary");        // "lokki-button lokki-button--primary"
 * button("icon", "disabled");     // "lokki-button__icon lokki-button__icon--disabled"
 */
export function bem(block: string) {
  return (element?: string | null, ...modifiers: (string | false | null | undefined)[]): string => {
    const base = element ? `${block}__${element}` : block;
    const classes = [base];
    for (const modifier of modifiers) {
      if (modifier) classes.push(`${base}--${modifier}`);
    }
    return classes.join(" ");
  };
}
