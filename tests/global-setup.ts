import { execFileSync } from 'node:child_process';

/** Builds the static site before unit smoke tests read dist/index.html. */
export default function setup(): void {
  execFileSync('npm', ['run', 'build'], { cwd: process.cwd(), stdio: 'inherit' });
}
