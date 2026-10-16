import api from './api';

/**
 * Serviço para gerenciar informações do plano e features
 */
class PlanService {
  /**
   * Busca informações completas do plano da organização
   */
  async getOrganizationPlan() {
    try {
      const response = await api.get('/api/plan-features/organization/current');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar plano da organização:', error);
      throw error;
    }
  }

  /**
   * Verifica se a organização tem acesso a uma feature específica
   */
  async checkFeatureAccess(featureName) {
    try {
      const response = await api.get(`/api/plan-features/features/check/${featureName}`);
      return response.data.hasAccess;
    } catch (error) {
      console.error(`Erro ao verificar feature ${featureName}:`, error);
      return false;
    }
  }

  /**
   * Verifica múltiplas features de uma vez
   */
  async checkMultipleFeatures(featureNames) {
    try {
      const response = await api.post('/api/plan-features/features/check-multiple', {
        features: featureNames
      });
      return response.data.features;
    } catch (error) {
      console.error('Erro ao verificar múltiplas features:', error);
      return {};
    }
  }

  /**
   * Busca todas as features disponíveis para a organização
   */
  async getOrganizationFeatures() {
    try {
      const response = await api.get('/api/plan-features/features');
      return response.data.features || {};
    } catch (error) {
      console.error('Erro ao buscar features:', error);
      return {};
    }
  }

  /**
   * Busca informações de uso e limites do plano
   */
  async getUsageInfo() {
    try {
      const response = await api.get('/api/plan-features/usage');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações de uso:', error);
      throw error;
    }
  }

  /**
   * Busca todos os planos disponíveis para upgrade
   */
  async getAvailablePlans() {
    try {
      const response = await api.get('/api/plan-features/available');
      return response.data.plans || [];
    } catch (error) {
      console.error('Erro ao buscar planos disponíveis:', error);
      return [];
    }
  }
}

export default new PlanService();
