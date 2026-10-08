# 로컬 CI용 Jenkins 이미지. 파이프라인이 직접 npm을 쓰도록 Node.js(프로젝트와 같은 24.x)를 포함한다.
FROM node:24-bookworm-slim AS node

FROM jenkins/jenkins:lts-jdk21

USER root
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
USER jenkins
