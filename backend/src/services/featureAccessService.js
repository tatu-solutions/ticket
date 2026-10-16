import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Organization from '../modules/organizations/organizationModel.js';
import logger from '../config/logger.js';

/**
 * Serviço para validação de acesso a funcionalidades baseado no plano
 */
class FeatureAccessService {
  /**
   * Verifica se uma organização tem acesso a uma funcionalidade específica
   * @param {string} organizationId - ID da organização
   * @param {string} featureName - Nome da feature (ex: 'knowledge_base')
   * @returns {Promise<boolean>} - true se tem acesso, false caso contrário
   */
  async checkFeatureAccess(organizationId, featureName) {
    try {
      // Buscar assinatura ativa da organização
      const subscription = await Subscription.findOne({
        where: { 
          organizationId,
          status: 'active'
        },
        include: [{
          model: Plan,
          as: 'plan'
        }]
      });

      // Se não tem assinatura ativa, não tem acesso
      if (!subscription || !subscription.plan) {
        logger.warn(`Organização ${organizationId} sem assinatura ativa`);
        return false;
      }

      // Verificar se a feature existe no plano
      const features = subscription.plan.features || {};
      const hasAccess = features[featureName] === true;

      logger.debug(`Feature access check: ${featureName} for org ${organizationId}: ${hasAccess}`);
      
      return hasAccess;
    } catch (error) {
      logger.error('Erro ao verificar acesso a feature:', error);
      return false;
    }
  }

  /**
   * Verifica múltiplas features de uma vez
   * @param {string} organizationId - ID da organização
   * @param {string[]} featureNames - Array de nomes de features
   * @returns {Promise<Object>} - Objeto com resultado de cada feature
   */
  async checkMultipleFeatures(organizationId, featureNames) {
    try {
      const subscription = await Subscription.findOne({
        where: { 
          organizationId,
          status: 'active'
        },
        include: [{
          model: Plan,
          as: 'plan'
        }]
      });

      if (!subscription || !subscription.plan) {
        // Retorna todas as features como false
        return featureNames.reduce((acc, name) => {
          acc[name] = false;
          return acc;
        }, {});
      }

      const features = subscription.plan.features || {};
      
      return featureNames.reduce((acc, name) => {
        acc[name] = features[name] === true;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Erro ao verificar múltiplas features:', error);
      return featureNames.reduce((acc, name) => {
        acc[name] = false;
        return acc;
      }, {});
    }
  }

  /**
   * Retorna todas as features disponíveis para uma organização
   * @param {string} organizationId - ID da organização
   * @returns {Promise<Object>} - Objeto com todas as features e seus valores
   */
  async getOrganizationFeatures(organizationId) {
    try {
      const subscription = await Subscription.findOne({
        where: { 
          organizationId,
          status: 'active'
        },
        include: [{
          model: Plan,
          as: 'plan'
        }]
      });

      if (!subscription || !subscription.plan) {
        return {};
      }

      return subscription.plan.features || {};
    } catch (error) {
      logger.error('Erro ao buscar features da organização:', error);
      return {};
    }
  }

  /**
   * Lança erro se a organização não tiver acesso à feature
   * @param {string} organizationId - ID da organização
   * @param {string} featureName - Nome da feature
   * @throws {Error} - Se não tiver acesso
   */
  async requireFeature(organizationId, featureName) {
    const hasAccess = await this.checkFeatureAccess(organizationId, featureName);
    
    if (!hasAccess) {
      const error = new Error(`Funcionalidade "${featureName}" não disponível no seu plano`);
      error.statusCode = 403;
      error.code = 'FEATURE_NOT_AVAILABLE';
      error.featureName = featureName;
      throw error;
    }
    
    return true;
  }

  /**
   * Verifica se a organização atingiu o limite de um recurso
   * @param {string} organizationId - ID da organização
   * @param {string} limitType - Tipo de limite (maxUsers, maxClients, etc)
   * @param {number} currentCount - Contagem atual
   * @returns {Promise<Object>} - { allowed: boolean, limit: number, current: number }
   */
  async checkResourceLimit(organizationId, limitType, currentCount) {
    try {
      const subscription = await Subscription.findOne({
        where: { 
          organizationId,
          status: 'active'
        },
        include: [{
          model: Plan,
          as: 'plan'
        }]
      });

      if (!subscription || !subscription.plan) {
        return {
          allowed: false,
          limit: 0,
          current: currentCount,
          message: 'Sem assinatura ativa'
        };
      }

      const plan = subscription.plan;
      const limit = plan[limitType];

      // -1 significa ilimitado
      if (limit === -1) {
        return {
          allowed: true,
          limit: -1,
          current: currentCount,
          message: 'Ilimitado'
        };
      }

      const allowed = currentCount < limit;

      return {
        allowed,
        limit,
        current: currentCount,
        message: allowed ? 'Dentro do limite' : `Limite de ${limit} atingido`
      };
    } catch (error) {
      logger.error('Erro ao verificar limite de recurso:', error);
      return {
        allowed: false,
        limit: 0,
        current: currentCount,
        message: 'Erro ao verificar limite'
      };
    }
  }

  /**
   * Retorna informações completas do plano da organização
   * @param {string} organizationId - ID da organização
   * @returns {Promise<Object>} - Informações do plano e limites
   */
  async getOrganizationPlanInfo(organizationId) {
    try {
      const subscription = await Subscription.findOne({
        where: { 
          organizationId,
          status: 'active'
        },
        include: [{
          model: Plan,
          as: 'plan'
        }, {
          model: Organization,
          as: 'organization'
        }]
      });

      if (!subscription || !subscription.plan) {
        return null;
      }

      const plan = subscription.plan;

      return {
        planId: plan.id,
        planName: plan.name,
        planDisplayName: plan.displayName,
        features: plan.features || {},
        limits: {
          maxUsers: plan.maxUsers,
          maxClients: plan.maxClients,
          maxStorageGB: plan.maxStorageGB,
          maxTicketsPerMonth: plan.maxTicketsPerMonth,
          maxAttachmentSizeMB: plan.maxAttachmentSizeMB
        },
        subscription: {
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          autoRenew: subscription.autoRenew
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar informações do plano:', error);
      return null;
    }
  }
}

export default new FeatureAccessService();
