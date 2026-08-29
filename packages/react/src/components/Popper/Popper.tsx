"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import {
  createPopper,
  type Instance,
  type Modifier,
  type Options,
  type Placement,
  type VirtualElement,
} from "@popperjs/core";
import { useForkRef } from "@okryshto/react-hooks";
import "@okryshto/design-system/components/Popper/Popper.scss";
import { mergeClassNames } from "../../helpers";

export type PopperPlacement = Placement;

export type PopperAnchorEl =
  HTMLElement | VirtualElement | (() => HTMLElement | VirtualElement | null) | null;

export interface PopperTransitionProps {
  /**
   * In.
   *
   * @default undefined
   * @type {boolean}
   */
  in: boolean;
  /**
   * On Enter.
   *
   * @default undefined
   * @type {() => void}
   */
  onEnter: () => void;
  /**
   * On Exited.
   *
   * @default undefined
   * @type {() => void}
   */
  onExited: () => void;
}

export interface PopperChildrenProps {
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {Placement}
   */
  placement: Placement;
  /**
   * Transition Props.
   *
   * @default undefined
   * @type {PopperTransitionProps}
   */
  TransitionProps?: PopperTransitionProps;
}

/**
 * Props follow MUI's Popper API (https://mui.com/material-ui/api/popper/) as closely
 * as this design allows: `open`/`anchorEl`/`placement`/`modifiers`/`popperOptions`/
 * `disablePortal`/`keepMounted`/`transition`/`popperRef` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`slots`/`slotProps`, no `component` polymorphism,
 * no RTL `direction` flip helper (ltr only for now).
 */
export interface PopperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Open.
   *
   * @default undefined
   * @type {boolean}
   */
  open: boolean;
  /**
   * Anchor El.
   *
   * @default undefined
   * @type {PopperAnchorEl}
   */
  anchorEl?: PopperAnchorEl;
  /**
   * Placement.
   *
   * @default "bottom"
   * @type {PopperPlacement}
   */
  placement?: PopperPlacement;
  /**
   * When true, children stay mounted while closed (hidden via `display: none`).
   *
   * @default false
   * @type {boolean}
   */
  keepMounted?: boolean;
  /**
   * Disable Portal.
   *
   * @default false
   * @type {boolean}
   */
  disablePortal?: boolean;
  /**
   * Container.
   *
   * @default undefined
   * @type {Element | DocumentFragment | null}
   */
  container?: Element | DocumentFragment | null;
  /**
   * Modifiers.
   *
   * @default undefined
   * @type {Array<Partial<Modifier<string, object>>>}
   */
  modifiers?: Array<Partial<Modifier<string, object>>>;
  /**
   * Popper Options.
   *
   * @default defaultPopperOptions
   * @type {Partial<Options>}
   */
  popperOptions?: Partial<Options>;
  /**
   * Popper Ref.
   *
   * @default undefined
   * @type {Ref<Instance | null>}
   */
  popperRef?: Ref<Instance | null>;
  /**
   * When true, children receive `TransitionProps` (render-prop API) so a transition like Grow can drive enter/exit while the popper stays mounted.
   *
   * @default false
   * @type {boolean}
   */
  transition?: boolean;
  /**
   * Size the popper from its anchor — what a select or an autocomplete listbox wants, so the panel lines up with the field. - `true` pins the width to the anchor's exactly. - `"min"` uses it as a floor instead, so a `width` in `style` (or longer content) can make the panel wider than the field, never narrower. MUI has no prop for this; it is done there with a Popper.js modifier, and that is exactly what this is, just named.
   *
   * @default false
   * @type {boolean | "min"}
   */
  matchAnchorWidth?: boolean | "min";
  /**
   * Floor for the popper's width. Pairs with `matchAnchorWidth` for narrow anchors.
   *
   * @default undefined
   * @type {number | string}
   */
  minWidth?: number | string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode | ((props: PopperChildrenProps) => ReactNode)}
   */
  children?: ReactNode | ((props: PopperChildrenProps) => ReactNode);
}

function resolveAnchorEl(
  anchorEl: PopperAnchorEl | undefined,
): HTMLElement | VirtualElement | null {
  if (anchorEl == null) return null;
  return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}

function isHTMLElement(element: HTMLElement | VirtualElement): element is HTMLElement {
  return (element as HTMLElement).nodeType !== undefined;
}

const defaultPopperOptions: Partial<Options> = {};

export const Popper = forwardRef<HTMLDivElement, PopperProps>(function Popper(
  {
    open,
    anchorEl,
    placement: placementProp = "bottom",
    keepMounted = false,
    disablePortal = false,
    container: containerProp,
    modifiers,
    popperOptions = defaultPopperOptions,
    popperRef: popperRefProp,
    transition = false,
    matchAnchorWidth = false,
    minWidth,
    children,
    className,
    style,
    role = "tooltip",
    ...rest
  },
  forwardedRef,
) {
  const [exited, setExited] = useState(true);
  const [placement, setPlacement] = useState<Placement>(placementProp);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const ownRef = useForkRef(tooltipRef, forwardedRef);
  const popperInstanceRef = useRef<Instance | null>(null);
  const handlePopperRef = useForkRef(popperInstanceRef, popperRefProp);
  const handlePopperRefRef = useRef(handlePopperRef);

  useLayoutEffect(() => {
    handlePopperRefRef.current = handlePopperRef;
  }, [handlePopperRef]);

  useImperativeHandle(popperRefProp, () => popperInstanceRef.current as Instance, []);

  const resolvedAnchor = useMemo(() => resolveAnchorEl(anchorEl), [anchorEl]);

  useEffect(() => {
    popperInstanceRef.current?.forceUpdate();
  });

  // Whether the node is in the DOM at all. Deliberately not the same thing as
  // `open`: during an exit transition the popper is closed but still on screen,
  // and it has to stay positioned for the whole way out.
  const shouldRender = keepMounted || open || (transition && !exited);

  useLayoutEffect(() => {
    if (!resolvedAnchor || !shouldRender || !tooltipRef.current) {
      return undefined;
    }

    let popperModifiers: Array<Partial<Modifier<string, object>>> = [
      {
        name: "preventOverflow",
        options: { altBoundary: disablePortal },
      },
      {
        name: "flip",
        options: { altBoundary: disablePortal },
      },
      {
        name: "onUpdate",
        enabled: true,
        phase: "afterWrite",
        fn: ({ state }) => {
          setPlacement(state.placement);
        },
      },
    ];

    if (matchAnchorWidth) {
      // `"min"` writes the floor and leaves `width` alone, so whatever the
      // caller put in `style` still decides how wide the panel actually is.
      const property = matchAnchorWidth === "min" ? "minWidth" : "width";
      popperModifiers.push({
        name: "matchAnchorWidth",
        enabled: true,
        phase: "beforeWrite",
        requires: ["computeStyles"],
        fn: ({ state }) => {
          state.styles.popper[property] = `${state.rects.reference.width}px`;
        },
        // Sized once up front too, so the first paint is not a frame at the
        // wrong width that then snaps.
        effect: ({ state }) => {
          const reference = state.elements.reference as HTMLElement;
          state.elements.popper.style[property] = `${reference.getBoundingClientRect().width}px`;
        },
      });
    }

    if (modifiers) {
      popperModifiers = popperModifiers.concat(modifiers);
    }
    if (popperOptions.modifiers) {
      popperModifiers = popperModifiers.concat(popperOptions.modifiers);
    }

    const popper = createPopper(resolvedAnchor, tooltipRef.current, {
      // Must agree with the `position: fixed` this component puts on the root.
      // Popper.js defaults to `absolute` and writes that onto the element; the
      // two only differ once the instance is destroyed, at which point the
      // React style wins and the same translate suddenly resolves against the
      // viewport instead of the offset parent — the popper jumps to a corner
      // mid-close.
      strategy: "fixed",
      placement: placementProp,
      ...popperOptions,
      modifiers: popperModifiers,
    });

    handlePopperRefRef.current?.(popper);

    const popperElement = tooltipRef.current;

    return () => {
      if (popperElement) {
        const { style: nodeStyle } = popperElement;
        const position = nodeStyle.position;
        const top = nodeStyle.top;
        const left = nodeStyle.left;
        const transform = nodeStyle.transform;
        popper.destroy();
        nodeStyle.position = position;
        nodeStyle.top = top;
        nodeStyle.left = left;
        nodeStyle.transform = transform;
      } else {
        popper.destroy();
      }
      handlePopperRefRef.current?.(null);
    };
  }, [
    resolvedAnchor,
    disablePortal,
    modifiers,
    shouldRender,
    popperOptions,
    placementProp,
    matchAnchorWidth,
  ]);

  useEffect(() => {
    setPlacement(placementProp);
  }, [placementProp]);

  const handleEnter = () => setExited(false);
  const handleExited = () => setExited(true);

  if (!shouldRender) {
    return null;
  }

  let container: Element | DocumentFragment | null | undefined = containerProp;
  if (container == null && resolvedAnchor && isHTMLElement(resolvedAnchor)) {
    container = resolvedAnchor.ownerDocument.body;
  }
  if (container == null && typeof document !== "undefined") {
    container = document.body;
  }

  const display = !open && keepMounted && (!transition || exited) ? "none" : undefined;
  const transitionProps: PopperTransitionProps | undefined = transition
    ? { in: open, onEnter: handleEnter, onExited: handleExited }
    : undefined;

  const childProps: PopperChildrenProps = { placement };
  if (transitionProps) {
    childProps.TransitionProps = transitionProps;
  }

  const node = (
    <div
      ref={ownRef}
      role={role}
      className={mergeClassNames("okryshto-component", "okryshto-popper", className)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        display,
        minWidth,
        ...style,
      }}
      {...rest}
    >
      {typeof children === "function" ? children(childProps) : children}
    </div>
  );

  if (disablePortal || !container) {
    return node;
  }

  return createPortal(node, container);
});
