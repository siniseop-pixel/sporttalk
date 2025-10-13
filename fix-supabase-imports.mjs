// fix-supabase-imports.mjs
// Usage:
//   node fix-supabase-imports.mjs         # 드라이런(어떤 파일이 바뀌는지 출력만)
//   node fix-supabase-imports.mjs --write # 실제로 파일 수정

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = process.cwd(); // 루트에서 실행 가정
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const WRITE = process.argv.includes('--write');

const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);

function walk(dir, out = []) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function isLikelyServerFile(filePath, content) {
  const rel = filePath.replace(PROJECT_ROOT, '').replace(/\\/g, '/');

  // 1) API 라우트는 무조건 서버
  if (/\/app\/api\//.test(rel)) return true;

  // 2) app 내 page/layout/route 등 서버 가능 파일
  if (/\/app\//.test(rel) && /(page|layout|route)\.(js|jsx|ts|tsx)$/.test(rel)) {
    // 파일 최상단에 'use client'가 있으면 클라이언트로 간주
    const head = content.slice(0, 300).trimStart();
    // 첫 비어있지 않은 줄만 검사 (주석/공백 제외)
    const firstLine = head.split(/\r?\n/).find(l => l.trim().length > 0) || '';
    if (/['"]use client['"]/.test(firstLine)) return false; // 클라이언트 컴포넌트면 제외
    return true;
  }

  return false;
}

function ensureAdminImport(code) {
  const hasAdminImport = /from\s+['"]@\/lib\/supabaseAdmin['"]/.test(code);
  if (hasAdminImport) return code;

  // import 블록 바로 아래에 추가
  const importBlock = code.match(/^(?:\s*import[^\n]*\n)+/m);
  const adminLine = `import { getSupabaseAdmin } from '@/lib/supabaseAdmin';\n`;

  if (importBlock) {
    const endIdx = importBlock.index + importBlock[0].length;
    return code.slice(0, endIdx) + adminLine + code.slice(endIdx);
  }
  return adminLine + code;
}

function addSupabaseConstIfNeeded(code) {
  const usesSupabaseDot = /\bsupabase\s*\./.test(code);
  const alreadyGetsAdmin = /getSupabaseAdmin\s*\(/.test(code);
  if (!usesSupabaseDot) return code;         // supabase 변수 안 쓰면 패스
  if (alreadyGetsAdmin) return code;         // 이미 호출함

  // import 블록 끝난 뒤에 한 줄 삽입
  const importBlock = code.match(/^(?:\s*import[^\n]*\n)+/m);
  const line = `\nconst supabase = getSupabaseAdmin();\n`;
  if (importBlock) {
    const endIdx = importBlock.index + importBlock[0].length;
    return code.slice(0, endIdx) + line + code.slice(endIdx);
  }
  return line + code;
}

function replaceClientImport(code) {
  // 여러 케이스: 확장자 유무, 세미콜론 유무, 따옴표 종류
  const patterns = [
    /import\s*\{\s*supabase\s*\}\s*from\s*['"]@\/lib\/supabaseClient(?:\.js)?['"]\s*;?\s*\n?/g,
    /import\s+supabase\s*from\s*['"]@\/lib\/supabaseClient(?:\.js)?['"]\s*;?\s*\n?/g,
  ];
  let changed = code;
  let removed = false;
  for (const re of patterns) {
    if (re.test(changed)) removed = true;
    changed = changed.replace(re, '');
  }
  return { changed, removed };
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!isLikelyServerFile(filePath, raw)) return { touched: false, reason: 'not-server' };

  // supabaseClient import가 없으면 스킵
  if (!/@\/lib\/supabaseClient/.test(raw)) return { touched: false, reason: 'no-client-import' };

  let code = raw;

  // 1) 잘못된 import 제거
  const { changed, removed } = replaceClientImport(code);
  code = changed;
  if (!removed) return { touched: false, reason: 'no-removal' };

  // 2) 서버용 admin import 보장
  code = ensureAdminImport(code);

  // 3) supabase 변수 필요 시 주입
  code = addSupabaseConstIfNeeded(code);

  if (WRITE) {
    // 백업 생성
    fs.writeFileSync(filePath + '.bak', raw, 'utf8');
    fs.writeFileSync(filePath, code, 'utf8');
  }

  return { touched: true, reason: 'fixed' };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('src 폴더를 찾을 수 없습니다. 프로젝트 루트에서 실행하세요.');
    process.exit(1);
  }

  const files = walk(SRC_DIR);
  let fixed = 0, totalTargets = 0;

  for (const f of files) {
    const rel = f.replace(PROJECT_ROOT, '').replace(/\\/g, '/');
    const res = processFile(f);
    if (res.reason !== 'not-server' && res.reason !== 'no-client-import') {
      totalTargets++;
    }
    if (res.touched) {
      fixed++;
      console.log(`${WRITE ? '[WRITE] ' : '[DRY]  '}fixed: ${rel}`);
    } else if (res.reason === 'no-client-import') {
      // ignore
    } else if (res.reason === 'not-server') {
      // ignore
    } else {
      console.log(`[SKIP]  ${rel} (${res.reason})`);
    }
  }

  console.log('\nSummary:');
  console.log(`  Candidates: ${totalTargets}`);
  console.log(`  ${WRITE ? 'Fixed' : 'Would fix'}: ${fixed}`);
  if (!WRITE) console.log(`\nRun with: node ${path.basename(__filename)} --write`);
}

main();
