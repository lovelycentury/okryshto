import type { CSSProperties, ReactElement, Ref } from "react";
import type { TransitionProps as RTGTransitionProps } from "react-transition-group/Transition";

export type TransitionTimeout =
  | number
  | {
      appear?: number;
      enter?: number;
      exit?: number;
    };

export type TransitionTimeoutWithAuto = TransitionTimeout | "auto";

export type TransitionEasing =
  | string
  | {
      enter?: string;
      exit?: string;
    };

export type TransitionCallback = (node: HTMLElement, isAppearing?: boolean) => void;
export type TransitionExitCallback = (node: HTMLElement) => void;

export interface TransitionCallbacks {
  onEnter?: TransitionCallback;
  onEntering?: TransitionCallback;
  onEntered?: TransitionCallback;
  onExit?: TransitionExitCallback;
  onExiting?: TransitionExitCallback;
  onExited?: TransitionExitCallback;
}

export interface SharedTransitionProps extends TransitionCallbacks {
  in?: boolean;
  appear?: boolean;
  easing?: TransitionEasing;
  style?: CSSProperties;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  addEndListener?: (node: HTMLElement, done: () => void) => void;
}

export type TransitionChildren = ReactElement<{
  style?: CSSProperties;
  className?: string;
  ref?: Ref<HTMLElement>;
}>;

export type TransitionMode = "enter" | "exit" | "appear";

export type RTGProps = Omit<RTGTransitionProps, "timeout" | "addEndListener" | "children">;
