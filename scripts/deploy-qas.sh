#!/bin/bash
# ==============================================================================
# Script de Deploy Automático para Ambiente QaS - T-Desk (TatuSolutions)
# Caminho de Execução: /var/www/tdesk
# ==============================================================================

set -e # Parar em caso de erro

APP_DIR="/var/www/tdesk"
REPO_URL="https://github.com/tatu-solutions/ticket.git"
BRANCH="QaS"
API_URL="https://tdesk-backend.tatusolutions.com/api"

echo "=================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] INICIANDO DEPLOY AUTOMÁTICO (QAS)"
echo "=================================================="

# 1. Navegar até o diretório do projeto
if [ ! -d "$APP_DIR" ]; then
  echo "📁 Criando diretório $APP_DIR..."
  mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# 2. Garantir que estamos no diretório da aplicação
cd "$APP_DIR"

# 3. BACKEND
echo "⚙️ Atualizando Backend..."
cd "$APP_DIR/backend"

if [ -f "package.json" ]; then
  npm ci --omit=dev
  
  # Preservar .env se existir na VPS
  if [ ! -f ".env" ] && [ -f ".env.production.example" ]; then
    echo "⚠️ Arquivo .env não encontrado no backend. Copiando de .env.production.example..."
    cp .env.production.example .env
  fi

  # Reiniciar no PM2
  echo "🔄 Reiniciando processo PM2..."
  if command -v pm2 >/dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
    pm2 save
  else
    echo "⚠️ PM2 não encontrado no PATH global. Tentando npx pm2..."
    npx pm2 reload ecosystem.config.cjs --update-env || npx pm2 start ecosystem.config.cjs
  fi
fi

# 4. FRONTENDS (Compilação dos 4 Portais com VITE_API_URL de produção/QAS)

build_portal() {
  local portal_name="$1"
  local portal_path="$APP_DIR/$portal_name"

  echo "--------------------------------------------------"
  echo "🔨 Compilando: $portal_name"
  echo "--------------------------------------------------"
  
  if [ -d "$portal_path" ]; then
    cd "$portal_path"
    
    # Criar/atualizar .env de build para garantir que a URL correta seja embutida
    cat <<EOF > .env.production
VITE_API_URL=$API_URL
NODE_ENV=production
EOF
    
    npm ci
    VITE_API_URL="$API_URL" npm run build
    
    # Garantir permissões de leitura para o Nginx (www-data)
    chmod -R 755 "$portal_path/dist" 2>/dev/null || true
    echo "✅ Build de $portal_name concluído com sucesso!"
  else
    echo "⚠️ Diretório não encontrado: $portal_path"
  fi
}

build_portal "portalSaaS"
build_portal "portalOrganizaçãoTenant"
build_portal "portalClientEmpresa"
build_portal "portalBackofficeSis"

# 5. NGINX
echo "🌐 Verificando e recarregando Nginx..."
if nginx -t; then
  systemctl reload nginx
  echo "✅ Nginx recarregado com sucesso!"
else
  echo "❌ Erro na configuração do Nginx! O Nginx não foi recarregado."
  exit 1
fi

echo "=================================================="
echo "🎉 DEPLOY DE QAS CONCLUÍDO COM SUCESSO!"
echo "Data: $(date)"
echo "=================================================="
