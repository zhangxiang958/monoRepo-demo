
/**
 * @typedef PackageInfo
 * @type {object}
 * @property {string} name
 * @property {string} version
 * @property {string} description
 * @property {string} main
 * @property {object} scripts
 * @property {string} author
 * @property {string} license
 * @property {object} dependencies
 * @property {object} devDependencies
 * @property {object} optionalDependencies
 * @property {object} peerDependencies
 */

/**
 * @typedef LockfileProjectSnapshot Map 类型都不是真正的 Map，只是对象
 * @type {object}
 * @property {Map<string, string>} specifiers
 * @property {Map<string, string>} dependencies
 * @property {Map<string, string>} devDependencies
 * @property {Map<string, string>} optionalDependencies
 * @property {object} dependenciesMeta
 * @property {string} publishDirectory
 */

/**
 * @typedef Lockfile Map 类型都不是真正的 Map，只是对象
 * @type {object}
 * @property {Map<string, LockfileProjectSnapshot>} importers 引包入口
 * @property {string | number} lockfileVersion
 * @property {LockfileProjectSnapshot} packages
 */

/**
 * @typedef ReadPackageContext
 * @type {object}
 * @property {function} log
 */

/**
 * Will be called after parse package dependencies
 * @param {PackageInfo} pkg 
 * @param {ReadPackageContext} context 
 * @returns 
 */
function readPackage(pkg, context) {
  // Override the manifest of foo@1.x after downloading it from the registry
  // if (pkg.name === 'foo' && pkg.version.startsWith('1.')) {
  //   // Replace bar@x.x.x with bar@2.0.0
  //   pkg.dependencies = {
  //     ...pkg.dependencies,
  //     bar: '^2.0.0'
  //   }
  //   context.log('bar@1 => bar@2 in dependencies of foo')
  // }

  // // This will change any packages using baz@x.x.x to use baz@1.2.3
  // if (pkg.dependencies.baz) {
  //   pkg.dependencies.baz = '1.2.3';
  // }
  // console.log('fuck', pkg, context, context.log('????'))
  if (pkg && pkg.dependencies && pkg.dependencies.koa) {
    pkg.dependencies.koa = '2.13.2'
    context.log(pkg.name, 'success change koa to 2.13.2')
  }
  // if (pkg && pkg.depen)
  // if (pkg.name.includes('koa')) {
  //   console.log('dev', pkg)
  // }

  return pkg
}

/**
 * Will be called after parse package dependencies
 * @param {Lockfile} lockfile 
 * @param {ReadPackageContext} context 
 * @returns 
 */
function afterAllResolved(lockfile, context) {
  // 直接依赖从上面 readPackage 里面来解决
  // 这里是解决间接依赖的问题
  /**
   * 第一步：
   * 1. 检查所有包，看下他们的生产依赖有没有依赖到 @grpc/grpc-js 这个包
   * 2. 如果依赖到了，判断是否符合要求，如果超过 1.7.3 版本，那么修改对应的包版本为 1.7.3
   */
  /**
   * 第二步：
   * 1. 检查这个包本身是不是 @grpc/grpc-js 这个包，如果超过这个版本的直接删除掉
   */
  /**
   * 第三步：
   * 1. 添加对应 1.7.3 的包的 hash 对应信息
   */
  if (lockfile.packages) {
    const allPackageNames = Object.keys(lockfile.packages)
    for (const packageName of allPackageNames) {
      const packageInfo = lockfile.packages[packageName]
      const packageDependencies = packageInfo.dependencies
      if (packageName.includes('@grpc/grpc-js')) {
        
      }
      if (packageDependencies && packageDependencies['@grpc/grpc-js']) {
        packageDependencies['@grpc/grpc-js'] = '1.7.3'
      }
    }
  }
  context.log('???? afterAllResolved')
  return lockfile
}

module.exports = {
  hooks: {
    readPackage,
    afterAllResolved
  }
}