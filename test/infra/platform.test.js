'use strict';
/**
 * infra/platform 纯函数测试：内置运行时平台目录 + PowerShell 可执行文件选择。
 * 这些映射决定 resources/runtime/<dir>/bin 的定位，写错会让 Linux/macOS 找不到自带 uv/node。
 */
import { test } from 'vitest';
import assert from 'node:assert';
import { runtimePlatformDir, RUNTIME_PLATFORMS, powershellBin, powershellHint } from '../../src/infra/platform.js';

test('runtimePlatformDir: Windows x64 → win-x64', () => {
  assert.strictEqual(runtimePlatformDir('win32', 'x64'), 'win-x64');
});

test('runtimePlatformDir: Windows 其它架构暂不支持（返回 null）', () => {
  assert.strictEqual(runtimePlatformDir('win32', 'arm64'), null);
  assert.strictEqual(runtimePlatformDir('win32', 'ia32'), null);
});

test('runtimePlatformDir: macOS x64/arm64', () => {
  assert.strictEqual(runtimePlatformDir('darwin', 'x64'), 'mac-x64');
  assert.strictEqual(runtimePlatformDir('darwin', 'arm64'), 'mac-arm64');
});

test('runtimePlatformDir: Linux x64/arm64', () => {
  assert.strictEqual(runtimePlatformDir('linux', 'x64'), 'linux-x64');
  assert.strictEqual(runtimePlatformDir('linux', 'arm64'), 'linux-arm64');
});

test('runtimePlatformDir: 未知平台返回 null', () => {
  assert.strictEqual(runtimePlatformDir('freebsd', 'x64'), null);
  assert.strictEqual(runtimePlatformDir('aix', 'ppc64'), null);
});

test('runtimePlatformDir: 默认参数回到当前进程平台且落在受支持集合内', () => {
  const dir = runtimePlatformDir();
  assert.ok(dir === null || RUNTIME_PLATFORMS.includes(dir));
});

test('powershellBin: Windows 用 powershell，其它平台用 pwsh', () => {
  assert.strictEqual(powershellBin('win32'), 'powershell');
  assert.strictEqual(powershellBin('darwin'), 'pwsh');
  assert.strictEqual(powershellBin('linux'), 'pwsh');
});

test('powershellHint: 提示里带上二进制名且非 Windows 指向安装 PowerShell 7', () => {
  assert.ok(powershellHint('powershell', 'win32').includes('powershell'));
  const linuxHint = powershellHint('pwsh', 'linux');
  assert.ok(linuxHint.includes('pwsh'));
  assert.ok(linuxHint.includes('bash'));
});
