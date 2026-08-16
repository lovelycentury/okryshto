import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import "@okryshto/design-system/components/Drawer/Drawer.scss";
import { Modal, type ModalProps } from "../Modal/Modal";

export type DrawerAnchor = "left" | "right" | "top" | "bottom";

/**
 * MUI also has `persistent` and `permanent`. They are absent here rather than
 * declared-and-ignored: a union member the component does not implement is a
 * promise the type makes and the runtime breaks. Widen this when the modes land.
 */
export type DrawerVariant = "temporary";

/**
 * Built on `Modal`, which owns the portal, backdrop, focus trap, scroll lock and
 * focus restoration — the same split `Dialog` uses. Drawer adds only the anchored,
 * sliding paper.
 *
 * Props follow MUI's Drawer API (https://mui.com/material-ui/api/drawer/) as
 * closely as this design allows: `open`/`onClose`/`anchor`/`children`/`variant`
 * match name-for-name, the `Modal` pass-throughs (`container`,
 * `disableEscapeKeyDown`, `disableScrollLock`, `hideBackdrop`, `slotProps`, …) are
 * forwarded, and `onClose` receives `(event, reason)`. Deliberate gaps: only the
 * `temporary` variant, no `sx`/`classes`, no `SwipeableDrawer`.
 *
 * `keepMounted` behaves as it does in MUI — the subtree stays in the DOM while
 * closed. Note that the drawer keeps *itself* mounted for the length of the exit
 * animation regardless, because `Modal` has no `closeAfterTransition`: unmounting
 * on the same tick `open` flips would cut the slide short.
 */
export interface DrawerProps extends Omit<ModalProps, "children"> {
  /**
   * Anchor.
   *
   * @default "right"
   * @type {DrawerAnchor}
   */
  anchor?: DrawerAnchor;
  /**
   * Variant.
   *
   * @default "temporary"
   * @type {DrawerVariant}
   */
  variant?: DrawerVariant;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onClose,
    anchor = "right",
    variant = "temporary",
    children,
    className,
    keepMounted = false,
    ...rest
  },
  forwardedRef,
) {
  const paperRef = useRef<HTMLDivElement>(null);
  // The paper's slide only plays while it is mounted, so closing cannot unmount on
  // the same tick as `open` flips false — that would skip straight to nothing and
  // cut the exit short. `mounted` stays true until the transform actually finishes.
  const [mounted, setMounted] = useState(open);
  // A separate flag, one frame behind `mounted`: the paper has to be committed at
  // its off-screen position before the class that moves it on-screen is added, or
  // the browser has no starting value to animate from.
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
  }, [open]);

  const handlePaperTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== paperRef.current) return;
    if (!open) setMounted(false);
  };

  const classes = [
    "okryshto-drawer",
    visible && "okryshto-drawer--open",
    `okryshto-drawer--anchor-${anchor}`,
    `okryshto-drawer--variant-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!mounted && !keepMounted) return null;

  return (
    <Modal
      ref={forwardedRef}
      open={open}
      onClose={onClose}
      // Always on, whatever the caller asked for: while the exit animation runs
      // `open` is already false, and without this Modal would return null and take
      // the sliding paper with it. The caller's own `keepMounted` is what decides
      // whether anything survives past the animation, above.
      keepMounted
      className={classes}
      {...rest}
    >
      <div
        ref={paperRef}
        className="okryshto-drawer__paper"
        role="dialog"
        aria-modal="true"
        onTransitionEnd={handlePaperTransitionEnd}
      >
        {children}
      </div>
    </Modal>
  );
});
