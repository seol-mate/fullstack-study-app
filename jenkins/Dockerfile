# 로컬 CI/CD용 Jenkins 이미지.
# - Node.js(프로젝트와 같은 24.x): 파이프라인이 직접 npm을 쓰도록 포함
# - Docker CLI + compose 플러그인: 호스트의 Docker 데몬(소켓 마운트)으로 이미지 빌드/배포
FROM node:24-bookworm-slim AS node

FROM jenkins/jenkins:lts-jdk21

USER root
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
 && rm -rf /var/lib/apt/lists/*
# 소켓 접근 권한 때문에 compose에서 root로 실행한다(로컬 연습 환경 전용).
