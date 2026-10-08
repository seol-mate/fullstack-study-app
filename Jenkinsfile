pipeline {
  agent any

  options {
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  // 로컬 Jenkins는 GitHub webhook을 받을 수 없으므로 주기적으로 변경을 확인한다.
  triggers {
    pollSCM('H/5 * * * *')
  }

  environment {
    CI = 'true'
    NEXT_TELEMETRY_DISABLED = '1'
    NPM_CONFIG_CACHE = '/var/jenkins_home/.npm'
    APP_TAG = "${env.BUILD_NUMBER}"
    COMPOSE = 'docker compose -f docker-compose.prod.yml'
  }

  stages {
    stage('Install') {
      steps {
        sh 'node -v && npm -v'
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Typecheck') {
      steps {
        // LayoutProps 같은 라우트 타입은 .next에 생성되므로, 깨끗한 체크아웃에서는 먼저 만들어야 한다.
        sh 'npx next typegen'
        sh 'npx tsc --noEmit'
      }
    }

    stage('Build') {
      environment {
        // 빌드 검증 전용 더미 값. 실제 비밀 값은 CI 빌드에 두지 않는다.
        SESSION_SECRET = 'ci-build-only-secret'
        DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/my_app'
      }
      steps {
        sh 'npm run build'
      }
    }

    // ---- CD: main 브랜치에서만 실행 (Git 플러그인은 GIT_BRANCH를 origin/main 형태로 준다) ----
    stage('Docker Image') {
      when {
        expression { env.GIT_BRANCH in ['origin/main', 'main'] }
      }
      steps {
        sh 'docker build --target migrate -t my-app-migrate:${APP_TAG} .'
        sh 'docker build -t my-app:${APP_TAG} .'
      }
    }

    stage('Deploy') {
      when {
        expression { env.GIT_BRANCH in ['origin/main', 'main'] }
      }
      steps {
        withCredentials([
          string(credentialsId: 'app-postgres-password', variable: 'POSTGRES_PASSWORD'),
          string(credentialsId: 'app-session-secret', variable: 'SESSION_SECRET'),
          string(credentialsId: 'app-anthropic-api-key', variable: 'ANTHROPIC_API_KEY')
        ]) {
          // 1) DB 기동 → 2) 마이그레이션 → 3) 앱 교체. --wait는 healthcheck 통과까지 기다리며 스모크 테스트를 겸한다.
          sh '$COMPOSE up -d --wait db'
          sh '$COMPOSE --profile migrate run --rm migrate'
          sh '$COMPOSE up -d --wait app'
        }
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed. 이전에 배포된 앱 컨테이너는 그대로 유지됩니다(Deploy 이전 단계 실패 시).'
    }
  }
}
