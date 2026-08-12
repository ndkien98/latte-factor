// src/store/algorithmParamsStore.ts — Zustand store for algorithm parameters

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlgorithmParams } from '../types';

const DEFAULT_PARAMS: AlgorithmParams = {
  k: 3,
  kmeansWeightAmount: 1,
  kmeansWeightFrequency: 1,
  kmeansWeightHour: 0.5,
  nbConfidenceThreshold: 0.7,
  lrForecastDays: 30,
  fvRate: 0.005,
  fvMonths: 12,
  budget: 500000,
  minSupport: 0.1,
  minConfidence: 0.6,
};

interface AlgorithmParamsState {
  params: AlgorithmParams;
  setParam: <K extends keyof AlgorithmParams>(key: K, value: AlgorithmParams[K]) => void;
  resetParams: () => void;
  saveParams: () => void;
}

export const useAlgorithmParamsStore = create<AlgorithmParamsState>()(
  persist(
    (set) => ({
      params: DEFAULT_PARAMS,

      setParam: (key, value) =>
        set((state) => ({
          params: { ...state.params, [key]: value },
        })),

      resetParams: () => set({ params: DEFAULT_PARAMS }),

      saveParams: () => {},
    }),
    { name: 'latte-factor-params' }
  )
);

export { DEFAULT_PARAMS };
