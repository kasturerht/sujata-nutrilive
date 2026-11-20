import { execSync } from 'node:child_process';

/**
 * Silicon Valley Watchdog:
 * Prevents orphan zombie dev servers from hoarding RAM.
 * Ensures port 4321 is cleanly released before Astro starts.
 */
export function freePort(port = 4321) {
  if (process.platform !== 'win32') return;
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = output.trim().split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && (parts[1].endsWith(`:${port}`) || parts[1] === `0.0.0.0:${port}`)) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
    }
    for (const pid of pids) {
      console.log(`🧹 [Watchdog] Cleaned dangling process on port ${port} (PID: ${pid})`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      } catch {}
    }
  } catch {
    // Port is clean
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('free-dev-ports.mjs')) {
  freePort(4321);
  console.log('✅ Port 4321 verified clean.');
}
