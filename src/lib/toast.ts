import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

const DURATION_MS = 3000;

type ToastState = {
  message: string;
  visible: boolean;
  // Changes on every showToast, so the same message shown twice still restarts the animation
  id: number;
};

let state: ToastState = { message: '', visible: false, id: 0 };
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const update = (next: ToastState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

// Shows a short message at the bottom of the screen. A new toast replaces the current one.
// Callable from anywhere (mutation callbacks, event handlers), not just components.
export const showToast = (message: string) => {
  clearTimeout(hideTimer);
  update({ message, visible: true, id: state.id + 1 });
  // Screen readers don't see the toast appear, so read it out
  AccessibilityInfo.announceForAccessibility(message);

  // Keep the message while it fades out
  hideTimer = setTimeout(() => update({ ...state, visible: false }), DURATION_MS);
};

export const useToast = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    () => state,
  );
