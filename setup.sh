#!/bin/bash

# Script de setup do bot CS2 Mix

echo "🎮 Setup do Bot CS2 Mix"
echo "======================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado. Instale Node.js 22+ e tente novamente."
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"
echo ""

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais do Discord!"
    echo ""
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

echo ""
echo "🗄️  Inicializando banco de dados..."
npm run db:generate
npm run db:push

echo ""
echo "🚀 Registrando comandos slash..."
npm run deploy:commands

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o bot em desenvolvimento:"
echo "  npm run dev"
echo ""
echo "Para fazer build para produção:"
echo "  npm run build"
echo ""
