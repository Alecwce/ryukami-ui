#!/usr/bin/env bash
# Instala el hook pre-push para auto-deploy automático a Cloudflare Pages en cada git push
set -e
HOOK_PATH=".git/hooks/pre-push"
cat << 'EOF' > "$HOOK_PATH"
#!/usr/bin/env bash
set -e
echo "⚡ [RYUKAMI AUTO-DEPLOY] Compilando 35 módulos + Astro y desplegando a Cloudflare Pages..."
pnpm run pages:deploy
echo "✅ [RYUKAMI AUTO-DEPLOY] Producción sincronizada en https://ryukami-ui.pages.dev"
EOF
chmod +x "$HOOK_PATH"
echo "✓ Hook de Auto-Deploy instalado en $HOOK_PATH"
