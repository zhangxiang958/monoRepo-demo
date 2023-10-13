FROM node:18 AS base
RUN npm i -g pnpm
ARG APP
WORKDIR /usr/app
# 整体复制整个 workspace 是 ok 的，只是需要修改服务启动路径
# COPY . /app
# 目标：只保留 app 里面的 lib 文件，然后外面是一样的

# 目前这个方式需要改入口的文件路径，这里可能有修改风险, 另外这里根目录的 node_modules 和子目录的 node_modules 不是完全一致的。
# 实际上需要复制子目录的 node_modules，这里做到了其实
# 只是这里的 packages 并不是只有
FROM base AS topdep
WORKDIR /
RUN mkdir node_modules pnpm-store packages
# 这里是可以省略掉的，因为已经从存储库这里复制出来了 package-import-method=copy
COPY pnpm-store/ pnpm-store
COPY node_modules/ node_modules
COPY packages/ packages

FROM topdep as svr
WORKDIR /usr/app
COPY ["pnpm-*.yaml", ".npmrc", "./"]

COPY "servers/${APP}/" .
RUN pnpm install --offline --ignore-scripts --frozen-lockfile

EXPOSE 8080
CMD /bin/sh -c "sleep 9999999"
