# mini

## 环境要求

### 运行环境
Mac 系统。
#### node 版本
```
 $ node -v
v18.16.0
```
#### pnpm 版本
```
$ pnpm -v
8.9.0
```

## Steps

### initial

```
pnpm init
```
其实根本不需要这样，直接一个 npm 仓库新建一个 pnpm-workspace.yaml 文件就行了

### add
pnpm add -Dw xxxx


### 构建镜像

```
docker build -f servers/proxy/Dockerfile -t testproxysvr --build-arg APP=proxy --target svr .
```

#### 构建现在可以在根目录执行了
一个牛逼的命令
```
pnpm run -r --if-present build:tar:docker
```

```
pnpm run -r --if-present build:docker:context
```

测试命令

```
pnpm run -r --if-present build:docker:context:list
```


### 测试镜像
```
docker run -it testproxysvr /bin/bash
```

#### 测试 context 镜像
```
docker run -it contextproxysvr /bin/bash
```
https://github1s.com/gaggle/exploring-the-monorepo/blob/attempt-perfect-docker/apps/web/Dockerfile#L41
https://dev.to/jonlauridsen/exploring-the-monorepo-5-perfect-docker-52aj


```
pnpm --silent --workspace-root pnpm-context servers/proxy/Dockerfile.context | docker build --build-arg PACKAGE_PATH=servers/proxy --build-arg APP=proxy - -t contextproxysvr
```

--silent 是只打印命令输出的内容，而不打印 pnpm 本身的东西，这个参数是必须的，否则会影响 docker context 的数据，导致解析失败从而无法打包



```
保证在 /app 路径下面

mkdir lib && ln -s /app/servers/proxy/lib/index.js /app/lib/index.js
```
