/** MUI `theme.transitions.duration.enteringScreen` */
export const DURATION_ENTERING_SCREEN = 225;
/** MUI `theme.transitions.duration.leavingScreen` */
export const DURATION_LEAVING_SCREEN = 195;
/** MUI `theme.transitions.duration.standard` */
export const DURATION_STANDARD = 300;

/** MUI `theme.transitions.easing.easeInOut` */
export const EASING_EASE_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";
/** MUI `theme.transitions.easing.easeOut` */
export const EASING_EASE_OUT = "cubic-bezier(0.0, 0, 0.2, 1)";
/** MUI `theme.transitions.easing.sharp` */
export const EASING_SHARP = "cubic-bezier(0.4, 0, 0.6, 1)";

export const DEFAULT_TIMEOUT = {
  enter: DURATION_ENTERING_SCREEN,
  exit: DURATION_LEAVING_SCREEN,
} as const;
