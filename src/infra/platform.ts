/**
 * 平台 → 内置运行时目录名（唯一真相源，供 infra 层使用）
 *
 * 内置运行时（uv/node）按平台放在 `resources/runtime/<dir>/bin/`，
 * 目录名与 scripts/fetch-runtime.mjs 的 currentPlatform() 保持一致。
 *
 * 注意：plugins/ 不能依赖 infra（依赖方向铁律），故
 * `src/plugins/app-root.ts` 里有一份等价实现；改动时两边同步。
 */

/** 支持的内置运行时平台目录 */
export const RUNTIME_PLATFORMS = ['win-x64', 'mac-x64', 'mac-arm64', 'linux-x64', 'linux-arm64'] as const;

export type RuntimePlatform = typeof RUNTIME_PLATFORMS[number];

/**
 * 当前平台/架构对应的运行时目录名。
 * @param platform Node 的 process.platform 值
 * @param arch Node 的 process.arch 值
 * @returns 目录名；不支持的平台返回 null
 */
function runtimePlatformDir(
  platform: string = process.platform,
  arch: string = process.arch,
): RuntimePlatform | null {
  if (platform === 'win32') return arch === 'x64' ? 'win-x64' : null;
  if (platform === 'darwin') return arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  if (platform === 'linux') return arch === 'arm64' ? 'linux-arm64' : 'linux-x64';
  return null;
}

export { runtimePlatformDir };

/**
 * PowerShell 可执行文件名：
 *  - Windows：系统自带 powershell（5.1），兼容性最好
 *  - Linux/macOS：PowerShell 7+ 的 `pwsh`（Windows 上的 `pwsh` 也可能存在，但优先用自带 powershell）
 */
function powershellBin(platform: string = process.platform): string {
  return platform === 'win32' ? 'powershell' : 'pwsh';
}

/** 未找到 PowerShell 时的友好提示（ENOENT 场景） */
function powershellHint(bin: string = powershellBin(), platform: string = process.platform): string {
  if (platform === 'win32') {
    return '未找到 ' + bin + '：请确认系统 PowerShell 可用，或改用 bash 工具';
  }
  return '未找到 ' + bin + '：Linux/macOS 需先安装 PowerShell 7+（https://aka.ms/powershell），或改用 bash 工具';
}

export { powershellBin, powershellHint };
