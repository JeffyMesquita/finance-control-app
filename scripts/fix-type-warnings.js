const fs = require("fs");
const path = require("path");

/**
 * Script para corrigir warnings de tipos nos logs
 * Adiciona 'as Error' onde necessário
 */

const sourceDir = "./";
const excludeDirs = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "scripts",
];

function shouldProcessFile(filePath) {
  for (const excludeDir of excludeDirs) {
    if (filePath.includes(excludeDir)) return false;
  }
  const ext = path.extname(filePath);
  return [".ts", ".tsx"].includes(ext);
}

function fixTypeWarnings(content) {
  let fixed = content;
  let changes = 0;

  // Corrigir logger.error com parâmetros unknown
  // logger.error("message", error) → logger.error("message", error as Error)
  fixed = fixed.replace(
    /logger\.error\("([^"]+)",\s*([^)]+)\s*\)/g,
    (match, message, errorVar) => {
      // Se não já tem 'as Error', adicionar
      if (
        !errorVar.includes(" as Error") &&
        !errorVar.includes(" as unknown")
      ) {
        changes++;
        return `logger.error("${message}", ${errorVar.trim()} as Error)`;
      }
      return match;
    }
  );

  // Corrigir casos específicos como arrays
  fixed = fixed.replace(
    /logger\.error\("([^"]+)",\s*\[([^\]]+)\]\s*\)/g,
    (match, message, arrayContent) => {
      changes++;
      return `logger.error("${message}", new Error(\`[\${${arrayContent}}]\`))`;
    }
  );

  return { content: fixed, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    if (!content.includes("logger.error")) {
      return;
    }

    const { content: fixedContent, changes } = fixTypeWarnings(content);

    if (changes > 0) {
      fs.writeFileSync(filePath, fixedContent, "utf8");
      console.log(`✅ ${filePath}: ${changes} correções de tipo`);
    }
  } catch (error) {
    console.error(`❌ Erro em ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath);
    } else if (shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

console.log("🔧 Corrigindo warnings de tipos...\n");
walkDirectory(sourceDir);
console.log("\n✅ Correções de tipos concluídas!");
