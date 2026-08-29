"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import "@okryshto/design-system/components/Stepper/Stepper.scss";

export type StepperColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type StepperOrientation = "horizontal" | "vertical";

export interface StepperStep {
  /** Step label. */
  label: ReactNode;
  /** Supporting text shown under the label. */
  description?: ReactNode;
  /** Marks the step as optional. */
  optional?: boolean;
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Props follow MUI's Stepper API (https://mui.com/material-ui/api/stepper/) loosely:
 * `orientation`/`activeStep`/`alternativeLabel` match name-for-name. Deliberate
 * gaps: steps come from an `items`-style `steps` array (not `Step` children),
 * `color` uses okryshto tone names, and there's no `StepButton` / clickable jump in v1.
 */
export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Ordered steps in the flow.
   *
   * @default undefined
   * @type {StepperStep[]}
   */
  steps: StepperStep[];
  /**
   * Zero-based index of the active step.
   *
   * @default undefined
   * @type {number}
   */
  activeStep: number;
  /**
   * Orientation.
   *
   * @default "horizontal"
   * @type {StepperOrientation}
   */
  orientation?: StepperOrientation;
  /**
   * When true, labels sit below the step dots in horizontal mode.
   *
   * @default true
   * @type {boolean}
   */
  alternativeLabel?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   * @type {StepperColor}
   */
  color?: StepperColor;
}

type StepState = "done" | "active" | "pending";

function getStepState(index: number, activeStep: number): StepState {
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}

function StepLabel({ step }: { step: StepperStep }) {
  return (
    <>
      <div className="okryshto-stepper__label">
        {step.label}
        {step.optional && <span className="okryshto-stepper__optional">(optional)</span>}
      </div>
      {step.description && <div className="okryshto-stepper__description">{step.description}</div>}
    </>
  );
}

export function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  alternativeLabel = true,
  color = "primary",
  className,
  ...rest
}: StepperProps) {
  const classes = [
    "okryshto-component",
    "okryshto-stepper",
    `okryshto-stepper--${orientation}`,
    alternativeLabel && orientation === "horizontal" && "okryshto-stepper--alternative-label",
    color !== "primary" && `okryshto-stepper--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="list" {...rest}>
      {steps.map((step, index) => {
        const state = getStepState(index, activeStep);
        const isLast = index === steps.length - 1;
        const connectorActive = index < activeStep;

        const dot = (
          <span
            className={[
              "okryshto-stepper__dot",
              state === "done" && "okryshto-stepper__dot--done",
              state === "active" && "okryshto-stepper__dot--active",
              state === "pending" && "okryshto-stepper__dot--pending",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            {state === "done" ? (
              <span className="okryshto-stepper__check-icon">
                <CheckIcon />
              </span>
            ) : (
              index + 1
            )}
          </span>
        );

        return (
          <div
            key={index}
            className={[
              "okryshto-stepper__step",
              state === "done" && "okryshto-stepper__step--done",
              state === "active" && "okryshto-stepper__step--active",
            ]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
            aria-current={state === "active" ? "step" : undefined}
          >
            <div className="okryshto-stepper__step-inner">
              {orientation === "vertical" ? (
                <>
                  <div className="okryshto-stepper__track">
                    {dot}
                    {!isLast && (
                      <span
                        className={[
                          "okryshto-stepper__connector",
                          connectorActive && "okryshto-stepper__connector--active",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="okryshto-stepper__content">
                    <StepLabel step={step} />
                  </div>
                </>
              ) : alternativeLabel ? (
                <>
                  <div className="okryshto-stepper__track">
                    {dot}
                    {!isLast && (
                      <span
                        className={[
                          "okryshto-stepper__connector",
                          connectorActive && "okryshto-stepper__connector--active",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="okryshto-stepper__content">
                    <StepLabel step={step} />
                  </div>
                </>
              ) : (
                <div className="okryshto-stepper__inline-row">
                  {dot}
                  <div className="okryshto-stepper__content okryshto-stepper__content--inline">
                    <StepLabel step={step} />
                  </div>
                  {!isLast && (
                    <span
                      className={[
                        "okryshto-stepper__connector",
                        connectorActive && "okryshto-stepper__connector--active",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
