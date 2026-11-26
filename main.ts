// makefun-x-reposts-02 entry (Node 22, standard library only).
//
// The entry is the posts themselves: 15 posts of our own on X, all from
// one public account (@KKC45661384926), each quoting or directly replying
// to a different one of make.fun's newest posts on x.com/makefunai, each
// carrying make.fun / @makefunai and our play code mrrm6474 in its own
// words. POSTS.json at the repository root names their addresses; the
// house reads their reposts, quotes and likes from X.
//
// All this program has to do is copy POSTS.json from the repository root
// to /output/POSTS.json, where the gate reads it. Nothing it writes about
// the posts is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POSTS.json');
if (!existsSync(source)) {
  console.error(`POSTS.json missing in ${BOT_DIR}`);
  process.exit(1);
}

const listed = JSON.parse(readFileSync(source, 'utf8')).posts;
if (!Array.isArray(listed) || listed.length === 0 || listed.length > 15) {
  console.error('POSTS.json must list 1 to 15 post addresses');
  process.exit(1);
}

// Every address must be a real X status URL, all from one handle, no repeats.
const POST_URL = /^https:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/(\d+)$/;
const handles = new Set();
const seen = new Set();
for (const url of listed) {
  if (typeof url !== 'string') {
    console.error('POSTS.json entries must be strings');
    process.exit(1);
  }
  const m = POST_URL.exec(url);
  if (!m) {
    console.error(`bad post address: ${url}`);
    process.exit(1);
  }
  handles.add(m[1]);
  if (seen.has(url)) {
    console.error(`duplicate post address: ${url}`);
    process.exit(1);
  }
  seen.add(url);
}
if (handles.size !== 1) {
  console.error('POSTS.json posts must all be from one X handle');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, 'POSTS.json'));
console.log(`copied POSTS.json with ${listed.length} posts to ${OUTPUT_DIR}`);
