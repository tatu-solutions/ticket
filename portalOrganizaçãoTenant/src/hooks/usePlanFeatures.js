import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import planService from '../services/planService';

/**
 * Store para gerenciar features do plano
 */
export const usePlanFeaturesStore = create(
  persist(
    (set, get) => ({
      features: {},
      planInfo: null,
      loading: false,
      loaded: false,
      lastFetch: null,

      // Carregar features do plano
      loadFeatures: async (force = false) => {
        const { loaded, lastFetch, loading } = get();
        
        // Evitar múltiplas chamadas simultâneas
        if (loading) return;
        
        // Cache de 5 minutos
        const CACHE_TIME = 5 * 60 * 1000;
        if (!force && loaded && lastFetch && (Date.now() - lastFetch < CACHE_TIME)) {
          return;
        }

        set({ loading: true });

        try {
          const [features, planInfo] = await Promise.all([
            planService.getOrganizationFeatures(),
            planService.getOrganizationPlan().catch(() => null)
          ]);

          set({
            features: features || {},
            planInfo,
            loaded: true,
            loading: false,
            lastFetch: Date.now()
          });
        } catch (error) {
          console.error('Erro ao carregar features do plano:', error);
          set({ loading: false });
        }
      },

      // Verificar se tem acesso a uma feature
      hasFeature: (featureName) => {
        const { features } = get();
        return features[featureName] === true;
      },

      // Verificar múltiplas features (todas requeridas)
      hasAllFeatures: (featureNames) => {
        const { features } = get();
        return featureNames.every(name => features[name] === true);
      },

      // Verificar múltiplas features (pelo menos uma)
      hasAnyFeature: (featureNames) => {
        const { features } = get();
        return featureNames.some(name => features[name] === true);
      },

      // Limpar cache
      clearCache: () => {
        set({
          features: {},
          planInfo: null,
          loaded: false,
          lastFetch: null
        });
      },

      // Atualizar features manualmente
      setFeatures: (features) => {
        set({ features, loaded: true, lastFetch: Date.now() });
      }
    }),
    {
      name: 'plan-features-storage',
      partialize: (state) => ({
        features: state.features,
        planInfo: state.planInfo,
        lastFetch: state.lastFetch
      })
    }
  )
);

/**
 * Hook para usar features do plano
 */
export const usePlanFeatures = () => {
  const store = usePlanFeaturesStore();

  return {
    features: store.features,
    planInfo: store.planInfo,
    loading: store.loading,
    loaded: store.loaded,
    loadFeatures: store.loadFeatures,
    hasFeature: store.hasFeature,
    hasAllFeatures: store.hasAllFeatures,
    hasAnyFeature: store.hasAnyFeature,
    clearCache: store.clearCache,
    setFeatures: store.setFeatures
  };
};

export default usePlanFeatures;
