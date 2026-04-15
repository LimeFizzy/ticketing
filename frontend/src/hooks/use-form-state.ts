import { useReducer } from 'react';

export function useFormState<T extends object>(
  initial: T
): [T, (patch: Partial<T>) => void] {
  return useReducer(
    (state: T, patch: Partial<T>): T => ({ ...state, ...patch }),
    initial
  );
}
