pipeline {
  agent any

  options {
    timeout(time: 20, unit: 'MINUTES')
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
    // 빌드 검증 전용 더미 값. 실제 비밀 값은 CI에 두지 않는다.
    SESSION_SECRET = 'ci-build-only-secret'
    DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/my_app'
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
      steps {
        sh 'npm run build'
      }
    }
  }
}
