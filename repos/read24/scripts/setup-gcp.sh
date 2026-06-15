#!/usr/bin/env bash
# ============================================
# Read24 — GCP one-time setup script
# รันครั้งเดียวก่อน deploy ครั้งแรก
# Usage:
#   ./scripts/setup-gcp.sh
# ============================================
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-maxwallet}"
REGION="${REGION:-asia-southeast1}"
BUCKET="${BUCKET:-read24-files-maxwallet}"

echo "→ Setting up GCP for Read24 (project: $PROJECT_ID, region: $REGION)"

gcloud config set project "$PROJECT_ID"

echo ""
echo "[1/4] Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com

echo ""
echo "[2/4] Creating Artifact Registry (with auto-cleanup policy)..."
gcloud artifacts repositories create read24 \
  --repository-format=docker \
  --location="$REGION" \
  --description="Read24 demo images" || echo "  (already exists)"

# Auto-delete old images — keep last 3 only (free tier limit 0.5GB)
cat > /tmp/read24-cleanup-policy.json <<'POLICY'
[
  {
    "name": "keep-last-3",
    "action": {"type": "Keep"},
    "mostRecentVersions": {"keepCount": 3}
  },
  {
    "name": "delete-older",
    "action": {"type": "Delete"},
    "condition": {"olderThan": "7d"}
  }
]
POLICY
gcloud artifacts repositories set-cleanup-policies read24 \
  --location="$REGION" \
  --policy=/tmp/read24-cleanup-policy.json || echo "  (cleanup policy skipped)"

echo ""
echo "[3/4] Creating GCS bucket: $BUCKET"
gcloud storage buckets create "gs://${BUCKET}" \
  --location="$REGION" \
  --uniform-bucket-level-access || echo "  (already exists)"

echo ""
echo "[4/4] Done. Next steps:"
echo ""
echo "  A) สร้าง Secrets ใน Secret Manager (รันแต่ละบรรทัด):"
cat <<'EOF'
     echo -n "<MongoDB Atlas URI>" | gcloud secrets create read24-mongodb-uri --data-file=-
     echo -n "$(openssl rand -hex 32)" | gcloud secrets create read24-jwt-secret --data-file=-
     echo -n "$(openssl rand -hex 32)" | gcloud secrets create read24-refresh-secret --data-file=-

  B) สร้าง GCS HMAC key สำหรับ S3-compatible access:
     1. ไป Console → Cloud Storage → Settings → Interoperability
     2. กด "Create access key for service account"
     3. เลือก/สร้าง service account ที่มี role "Storage Object Admin"
     4. เก็บ Access Key + Secret ไว้ แล้วใส่เป็น secret:

     echo -n "<HMAC access key>" | gcloud secrets create read24-gcs-access-key --data-file=-
     echo -n "<HMAC secret>"     | gcloud secrets create read24-gcs-secret-key --data-file=-

  C) ให้ Cloud Run service account อ่าน secrets ได้:
     PROJECT_NUMBER=$(gcloud projects describe maxwallet --format='value(projectNumber)')
     SA="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
     for s in read24-mongodb-uri read24-jwt-secret read24-refresh-secret \
              read24-gcs-access-key read24-gcs-secret-key; do
       gcloud secrets add-iam-policy-binding "$s" \
         --member="$SA" --role="roles/secretmanager.secretAccessor"
     done

  D) ตั้ง Budget Alert (กันค่าใช้จ่ายเผลอเด้ง):
     1. ไป Console → Billing → Budgets & alerts → CREATE BUDGET
     2. ตั้ง amount = 50 THB/เดือน
     3. Alert ที่ 50%, 90%, 100% → ส่งเข้า email
     (ทำผ่าน Console ง่ายกว่า CLI เพราะต้องรู้ billing-account ID)

  E) Deploy:
     ./scripts/deploy.sh
EOF
