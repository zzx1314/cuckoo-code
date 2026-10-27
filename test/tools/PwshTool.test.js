'use strict';
import { test } from 'vitest';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { PwshTool, DANGEROUS_PWSH_CMDS } from '../../src/tools/impl/pwsh.js';
import { powershellBin } from '../../src/infra/platform.js';

/** 本机是否真的有 PowerShell（Windows 自带 powershell；Linux/macOS 需 pwsh） */
function hasPowerShell() {
  try {
    execFileSync(powershellBin(), ['-NoProfile', '-Command', 'exit 0'], { stdio: 'ignore', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

test('DANGEROUS_PWSH_CMDS 定义完整', () => {
  assert.ok(Array.isArray(DANGEROUS_PWSH_CMDS));
  assert.ok(DANGEROUS_PWSH_CMDS.length >= 13);
});

test('PwshTool 危险命令拒绝', async () => {
  const tool = new PwshTool();
  const cmds = [
    'rm -rf /',
    'format C:',
    'Stop-Computer',
    'Restart-Computer',
    'Clear-Disk',
  ];
  for (const cmd of cmds) {
    const r = await tool.execute({ command: cmd, description: 'test' });
    assert.strictEqual(r.success, false);
    assert.match(r.error, /安全策略拒绝/);
  }
});

test('PwshTool 空命令拒绝', async () => {
  const tool = new PwshTool();
  const r = await tool.execute({ command: '', description: 'test' });
  assert.strictEqual(r.success, false);
  assert.match(r.error, /invalid command/);
});

test.skipIf(!hasPowerShell())('PwshTool 空描述不拒绝', async () => {
  const tool = new PwshTool();
  const r = await tool.execute({ command: 'Write-Output hi', description: '' });
  assert.strictEqual(r.success, true);
});

test.skipIf(hasPowerShell())('PwshTool 未安装 PowerShell 时返回明确提示', async () => {
  const tool = new PwshTool();
  const r = await tool.execute({ command: 'Write-Output hi', description: 'test' });
  assert.strictEqual(r.success, false);
  assert.match(r.error, /PowerShell/);
  assert.match(r.error, /bash/);
});

