/**
 * 应用根路径解析（纯 node，不依赖 electron）
 *
 * 打包版：process.resourcesPath = <安装目录>/resources（asar 同级）
 * 开发版：process.resourcesPath 不存在，回退到源码目录推算（out/src/plugins/xxx → 上 4 级）
 *
 * 为什么不用 import.meta.dirname 往上推算：
 *   打包后代码在 asar 内，import.meta.dirname 是 resources/app.asar/out/src/plugins/xxx，
 *   往上 4 级是 resources/app.asar，再拼 resources/runtime 就变成
 *   resources/app.asar/resources/runtime（不存在，实际在 resources/runtime）。
 */
import path from 'node:path';
import fs from 'node:fs';

/**
 * 当前平台/架构对应的内置运行时目录名（resources/runtime/<dir>）。
 * 与 infra/platform.ts、scripts/fetch-runtime.mjs 的映射保持一致
 * （plugins 不能依赖 infra，故此处保留一份等价实现）。
 * @returns 目录名；不支持的平台返回 null
 */
export function runtimePlatformDir(
  platform: string = process.platform,
  arch: string = process.arch,
): string | null {
  if (platform === 'win32') return arch === 'x64' ? 'win-x64' : null;
  if (platform === 'darwin') return arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  if (platform === 'linux') return arch === 'arm64' ? 'linux-arm64' : 'linux-x64';
  return null;
}

/** 找应用根（开发=项目根；打包=resources 同级目录），用于拼 resources/runtime 等内置资源 */
export function resolveResourceRoot(): string {
  // 打包版：process.resourcesPath 指向 resources/，resources/runtime 直接存在
  const rp = (process as any).resourcesPath;
  if (typeof rp === 'string' && rp && fs.existsSync(path.join(rp, 'runtime'))) {
    return rp;
  }
  // 开发版：out/src/plugins/<xxx> → 上 4 级 = 项目根 → resources/runtime
  const appRoot = path.join(import.meta.dirname, '..', '..', '..', '..');
  return path.join(appRoot, 'resources');
}

/** 找应用根（用于拼 node_modules 等），开发=项目根；打包=asar 根 */
export function resolveAppRoot(): string {
  const rp = (process as any).resourcesPath;
  if (typeof rp === 'string' && rp) {
    // 打包版：app.asar 在 resources/ 下
    const asar = path.join(rp, 'app.asar');
    if (fs.existsSync(asar)) return asar;
    return rp;
  }
  // 开发版：out/src/plugins/<xxx> → 上 4 级 = 项目根
  return path.join(import.meta.dirname, '..', '..', '..', '..');
}
