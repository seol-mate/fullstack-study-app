# 병렬 작업용 git worktree 생성
# 사용: powershell -File scripts/new-worktree.ps1 <이름> [-Port 3001]
# 결과: ..\fullstack-study-app-wt\<이름> (브랜치 work/<이름>), .env.local 복사, npm ci 완료 상태
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [int]$Port = 0
)
$ErrorActionPreference = "Stop"

$root = (git rev-parse --show-toplevel).Trim()
$dest = Join-Path (Split-Path $root -Parent) "fullstack-study-app-wt\$Name"
$branch = "work/$Name"

git -C $root worktree add -b $branch $dest main
if ($LASTEXITCODE -ne 0) { throw "worktree 생성 실패" }

# 환경변수 (git 제외 파일)
Copy-Item (Join-Path $root ".env.local") (Join-Path $dest ".env.local")
if (Test-Path (Join-Path $root ".claude\settings.local.json")) {
  New-Item -ItemType Directory -Force (Join-Path $dest ".claude") | Out-Null
  Copy-Item (Join-Path $root ".claude\settings.local.json") (Join-Path $dest ".claude\settings.local.json")
}

Push-Location $dest
try { npm ci } finally { Pop-Location }

if ($Port -eq 0) { $Port = 3000 + (git -C $root worktree list).Count - 1 }
Write-Host ""
Write-Host "준비 완료: $dest  (브랜치 $branch)"
Write-Host "dev 서버: npm run dev -- -p $Port"
Write-Host "정리: git worktree remove `"$dest`"; git branch -d $branch"
