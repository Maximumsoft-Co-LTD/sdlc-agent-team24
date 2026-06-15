#!/usr/bin/env bash
# ============================================
# Read24 — Cloud Run deploy script
# Usage:
#   ./scripts/deploy.sh           # deploy with defaults
#   PROJECT_ID=xxx ./scripts/deploy.sh
# Prereqs:
#   - gcloud auth login + set project
#   - Secrets ใน Secret Manager พร้อม:
#       read24-mongodb-uri, read24-jwt-secret, read24-refresh-secret,
#       read24-gcs-access-key, read24-gcs-secret-key
#   - GCS bucket "read24-files" สร้างแล้ว
# ============================================
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-maxwallet}"
REGION="${REGION:-asia-southeast1}"
SERVICE="${SERVICE:-read24}"
BUCKET="${BUCKET:-read24-files-maxwallet}"

cd "$(dirname "$0")/.."

echo "→ Deploying $SERVICE to $REGION (project: $PROJECT_ID)"

gcloud run deploy "$SERVICE" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --timeout 60 \
  --concurrency 80 \
  --cpu-throttling \
  --set-secrets "MONGODB_URI=read24-mongodb-uri:latest,JWT_SECRET=read24-jwt-secret:latest,REFRESH_TOKEN_SECRET=read24-refresh-secret:latest,MINIO_ACCESS_KEY=read24-gcs-access-key:latest,MINIO_SECRET_KEY=read24-gcs-secret-key:latest" \
  --set-env-vars "NODE_ENV=production,MINIO_ENDPOINT=storage.googleapis.com,MINIO_PORT=443,MINIO_USE_SSL=true,MINIO_BUCKET=${BUCKET},JWT_EXPIRES_IN=15m"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT_ID" --format='value(status.url)')
echo ""
echo "✅ Deployed: $URL"
echo ""
echo "Update NEXT_PUBLIC_APP_URL to match:"
echo "  gcloud run services update $SERVICE --region $REGION --update-env-vars NEXT_PUBLIC_APP_URL=$URL"
