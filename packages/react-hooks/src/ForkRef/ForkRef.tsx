"use client";

import { useMemo, type Ref, type RefCallback } from "react";

function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

export function useForkRef<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> | null {
  return useMemo(() => {
    if (!refs.some(Boolean)) {
      return null;
    }
    return (instance: T | null) => {
      for (const ref of refs) {
        setRef(ref, instance);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs compared by identity like MUI
  }, refs);
}
