'use strict';
/**
 * plugins/app-root 的运行时平台映射测试。
 * plugins 层不能依赖 infra，故这里有一份与 infra/platform 等价的实现——用例保证两份不漂移。
 */
import { test } from 'vitest';
import assert from 'node:assert';
import path from 'node:path';
import { runtimePlatformDir, resolveResourceRoot } from '../../src/plugins/app-root.js';
import { runtimePlatformDir as infraRuntimePlatformDir } from '../../src/infra/platform.js';

test('runtimePlatformDir: 与 infra 层映射保持一致', () => {
  const cases = [
    ['win32', 'x64'],
    ['win32', 'arm64'],
    ['darwin', 'x64'],
    ['darwin', 'arm64'],
    ['linux', 'x64'],
    ['linux', 'arm64'],
    ['freebsd', 'x64'],
  ];
  for (const [platform, arch] of cases) {
    assert.strictEqual(
      runtimePlatformDir(platform, arch),
      infraRuntimePlatformDir(platform, arch),
      '不一致: ' + platform + '-' + arch,
    );
  }
});

test('runtimePlatformDir: Linux 两种架构都有目录名', () => {
  assert.strictEqual(runtimePlatformDir('linux', 'x64'), 'linux-x64');
  assert.strictEqual(runtimePlatformDir('linux', 'arm64'), 'linux-arm64');
});

test('resolveResourceRoot: 返回名为 resources 的绝对路径', () => {
  const root = resolveResourceRoot();
  assert.ok(path.isAbsolute(root));
  assert.ok(root.endsWith('resources'));
});
