import { useCallback, useMemo, useState } from 'react';

export interface SelectionCounterApi<T> {
  selectedIds: T[];
  selectedCount: number;
  isSelected: (id: T) => boolean;
  toggleSelection: (id: T) => void;
  reset: () => void;
}

export const useSelectionCounter = <T,>(): SelectionCounterApi<T> => {
  const [selected, setSelected] = useState<Set<T>>(new Set());

  const toggleSelection = useCallback((id: T) => {
    setSelected((current: Set<T>) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: T) => selected.has(id), [selected]);

  const selectedIds = useMemo(() => Array.from(selected.values()), [selected]);
  const selectedCount = selectedIds.length;

  return {
    selectedIds,
    selectedCount,
    isSelected,
    toggleSelection,
    reset
  };
};
