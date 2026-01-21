# Script de déploiement automatique pour Cloud Run
# Usage: ./deploy.ps1

Write-Host "🎭 Déploiement de Court of Shadows sur Google Cloud Run" -ForegroundColor Cyan
Write-Host ""

# Vérifier que gcloud est installé
try {
    $gcloudVersion = gcloud --version 2>&1
    Write-Host "✅ Google Cloud SDK détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK n'est pas installé" -ForegroundColor Red
    Write-Host "Installez-le depuis: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Demander le nom du projet
$projectId = Read-Host "Entrez l'ID de votre projet Google Cloud (ex: court-of-shadows-game)"

# Configurer le projet
Write-Host ""
Write-Host "📋 Configuration du projet..." -ForegroundColor Yellow
gcloud config set project $projectId

# Demander la région
Write-Host ""
Write-Host "🌍 Régions disponibles:"
Write-Host "  1. europe-west1 (Belgique) - Recommandé pour l'Europe"
Write-Host "  2. us-central1 (Iowa) - USA"
Write-Host "  3. asia-east1 (Taiwan) - Asie"
$regionChoice = Read-Host "Choisissez une région (1-3)"

$region = switch ($regionChoice) {
    "1" { "europe-west1" }
    "2" { "us-central1" }
    "3" { "asia-east1" }
    default { "europe-west1" }
}

Write-Host ""
Write-Host "🚀 Déploiement en cours sur $region..." -ForegroundColor Cyan
Write-Host "   Cette opération peut prendre 2-5 minutes..." -ForegroundColor Yellow
Write-Host ""

# Déployer
gcloud run deploy court-of-shadows `
  --source . `
  --platform managed `
  --region $region `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 300s `
  --port 8080

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Déploiement réussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎮 Votre jeu est maintenant accessible publiquement !" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Pour voir les logs:" -ForegroundColor Yellow
    Write-Host "   gcloud run services logs tail court-of-shadows --region $region" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Pour mettre à jour:" -ForegroundColor Yellow
    Write-Host "   ./deploy.ps1" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host "Consultez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
}
