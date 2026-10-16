import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { AlertCircle, Lock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Componente para proteger funcionalidades baseado no plano
 * 
 * @param {Object} props
 * @param {string|string[]} props.feature - Feature(s) requerida(s)
 * @param {boolean} props.requireAll - Se true, requer todas as features. Se false, requer pelo menos uma
 * @param {React.ReactNode} props.children - Conteúdo a ser renderizado se tiver acesso
 * @param {React.ReactNode} props.fallback - Conteúdo alternativo se não tiver acesso
 * @param {boolean} props.showUpgrade - Se deve mostrar mensagem de upgrade
 * @param {string} props.upgradeMessage - Mensagem personalizada de upgrade
 */
const FeatureGate = ({
  feature,
  requireAll = true,
  children,
  fallback = null,
  showUpgrade = true,
  upgradeMessage = null
}) => {
  const { hasFeature, hasAllFeatures, hasAnyFeature, planInfo } = usePlanFeatures();

  // Normalizar feature para array
  const features = Array.isArray(feature) ? feature : [feature];

  // Verificar acesso
  let hasAccess = false;
  if (features.length === 1) {
    hasAccess = hasFeature(features[0]);
  } else if (requireAll) {
    hasAccess = hasAllFeatures(features);
  } else {
    hasAccess = hasAnyFeature(features);
  }

  // Se tem acesso, renderizar children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Se tem fallback customizado, usar ele
  if (fallback !== null) {
    return <>{fallback}</>;
  }

  // Se não deve mostrar upgrade, não renderizar nada
  if (!showUpgrade) {
    return null;
  }

  // Renderizar mensagem de upgrade padrão
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Funcionalidade não disponível
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {upgradeMessage || 'Esta funcionalidade não está incluída no seu plano atual.'}
          </p>
          {planInfo && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Plano atual: <span className="font-semibold">{planInfo.planDisplayName || planInfo.planName}</span>
            </p>
          )}
          <Link
            to="/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Fazer Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar badge "PRO" em features premium
 */
export const FeatureBadge = ({ feature, className = '' }) => {
  const { hasFeature } = usePlanFeatures();

  if (hasFeature(feature)) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded ${className}`}>
      <Lock className="w-3 h-3" />
      PRO
    </span>
  );
};

/**
 * Componente para desabilitar elementos baseado em feature
 */
export const FeatureDisabled = ({ feature, children, tooltip = 'Disponível em planos superiores' }) => {
  const { hasFeature } = usePlanFeatures();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {tooltip}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar alerta inline quando feature não disponível
 */
export const FeatureAlert = ({ feature, message, className = '' }) => {
  const { hasFeature } = usePlanFeatures();

  if (hasFeature(feature)) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span className="text-amber-800 dark:text-amber-300">
        {message || 'Esta funcionalidade não está disponível no seu plano.'}
      </span>
      <Link
        to="/subscription"
        className="ml-auto text-amber-600 dark:text-amber-400 hover:underline font-medium whitespace-nowrap"
      >
        Fazer Upgrade
      </Link>
    </div>
  );
};

export default FeatureGate;
