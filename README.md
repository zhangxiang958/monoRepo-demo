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


### 测试镜像
```
docker run -it testproxysvr /bin/bash
```

#### 测试 context 镜像
```
docker run -it contextproxysvr /bin/bash
```