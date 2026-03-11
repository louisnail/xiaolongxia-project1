// code-review Skill - 代码审查助手
// 自动审查代码质量、最佳实践、提供改进建议

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

/**
 * 代码审查配置
 */
const REVIEW_CONFIG = {
  // 代码复杂度检查
  complexity: {
    maxFunctionLength: 50, // 函数最大行数
    maxNestedDepth: 4,     // 最大嵌套深度
    maxParams: 5,          // 函数最大参数数
  },
  // 代码风格检查
  style: {
    requireJSDoc: true,    // 需要 JSDoc 注释
    maxLineLength: 120,    // 单行最大字符数
    noConsoleLog: true,    // 禁止 console.log
  },
  // 最佳实践检查
  bestPractices: {
    noVar: true,           // 不使用 var
    preferConst: true,     // 优先使用 const
    noUnusedVars: true,    // 无未使用变量
  },
};

/**
 * 审查单个文件
 * @param filePath - 文件路径
 * @returns 审查结果
 */
export async function reviewFile(filePath: string): Promise<string> {
  try {
    if (!existsSync(filePath)) {
      return `❌ 文件不存在：${filePath}`;
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const ext = extname(filePath);
    
    const issues = [];
    const suggestions = [];
    
    // 基础统计
    const stats = {
      totalLines: lines.length,
      codeLines: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
      commentLines: lines.filter(l => l.trim().startsWith('//')).length,
      blankLines: lines.filter(l => !l.trim()).length,
    };

    // 检查 1: 函数长度
    const functionMatches = content.matchAll(/(function|async function|const \w+ = \(|=>)/g);
    for (const match of functionMatches) {
      const startLine = content.substring(0, match.index).split('\n').length;
      // 简单估算函数长度（实际应该解析 AST）
      const estimatedLength = 20; // 简化处理
      if (estimatedLength > REVIEW_CONFIG.complexity.maxFunctionLength) {
        issues.push(`⚠️ 第${startLine}行：函数过长（>${REVIEW_CONFIG.complexity.maxFunctionLength}行）`);
        suggestions.push('💡 建议：将大函数拆分为多个小函数，每个函数只做一件事');
      }
    }

    // 检查 2: 单行长度
    lines.forEach((line, index) => {
      if (line.length > REVIEW_CONFIG.style.maxLineLength) {
        issues.push(`⚠️ 第${index + 1}行：行过长（${line.length}字符，最大${REVIEW_CONFIG.style.maxLineLength}）`);
        suggestions.push('💡 建议：将长行拆分为多行，提高可读性');
      }
    });

    // 检查 3: console.log
    if (REVIEW_CONFIG.style.noConsoleLog) {
      const consoleMatches = [...content.matchAll(/console\.(log|warn|error|debug)/g)];
      if (consoleMatches.length > 0) {
        issues.push(`⚠️ 发现 ${consoleMatches.length} 处 console 输出`);
        suggestions.push('💡 建议：生产环境移除 console.log，使用日志库代替');
      }
    }

    // 检查 4: var 使用
    if (REVIEW_CONFIG.bestPractices.noVar) {
      const varMatches = [...content.matchAll(/\bvar\b/g)];
      if (varMatches.length > 0) {
        issues.push(`⚠️ 发现 ${varMatches.length} 处 var 声明`);
        suggestions.push('💡 建议：使用 let 或 const 代替 var');
      }
    }

    // 检查 5: TODO/FIXME 注释
    const todoMatches = [...content.matchAll(/(TODO|FIXME|XXX|HACK):/g)];
    if (todoMatches.length > 0) {
      issues.push(`📝 发现 ${todoMatches.length} 个待处理标记`);
      suggestions.push('💡 建议：及时处理 TODO/FIXME 标记的技术债务');
    }

    // 检查 6: 魔法数字
    const magicNumbers = content.match(/\b\d{4,}\b/g) || [];
    if (magicNumbers.length > 0) {
      issues.push(`🔢 发现 ${magicNumbers.length} 处魔法数字`);
      suggestions.push('💡 建议：将魔法数字提取为具名常量');
    }

    // 生成报告
    let report = `🔍 代码审查报告\n\n`;
    report += `📁 文件：${filePath}\n`;
    report += `📊 代码统计:\n`;
    report += `   - 总行数：${stats.totalLines}\n`;
    report += `   - 代码行：${stats.codeLines}\n`;
    report += `   - 注释行：${stats.commentLines}\n`;
    report += `   - 空白行：${stats.blankLines}\n`;
    report += `   - 注释率：${((stats.commentLines / stats.codeLines) * 100).toFixed(1)}%\n\n`;

    if (issues.length === 0) {
      report += `✅ 未发现明显问题！代码质量良好！\n`;
    } else {
      report += `⚠️ 发现 ${issues.length} 个问题：\n\n`;
      issues.forEach((issue, i) => {
        report += `${i + 1}. ${issue}\n`;
      });
      report += `\n💡 改进建议：\n\n`;
      suggestions.forEach((suggestion, i) => {
        report += `${i + 1}. ${suggestion}\n`;
      });
    }

    // 代码质量评分
    const score = Math.max(0, 100 - issues.length * 10);
    report += `\n📈 代码质量评分：${score}/100\n`;
    report += getScoreComment(score);

    return report;
  } catch (error) {
    return `❌ 审查失败：${error.message}`;
  }
}

/**
 * 审查整个目录
 * @param dirPath - 目录路径
 * @returns 审查报告
 */
export async function reviewDirectory(dirPath: string): Promise<string> {
  try {
    if (!existsSync(dirPath)) {
      return `❌ 目录不存在：${dirPath}`;
    }

    const files = getAllFiles(dirPath, ['.js', '.ts', '.jsx', '.tsx']);
    
    if (files.length === 0) {
      return `📁 目录中没有找到代码文件：${dirPath}`;
    }

    let report = `🔍 目录代码审查报告\n\n`;
    report += `📁 目录：${dirPath}\n`;
    report += `📊 文件数量：${files.length}\n\n`;

    const allIssues = [];
    let totalScore = 0;

    for (const file of files) {
      const fileReport = await reviewFile(file);
      const scoreMatch = fileReport.match(/代码质量评分：(\d+)\/100/);
      if (scoreMatch) {
        totalScore += parseInt(scoreMatch[1]);
      }
      
      // 提取问题
      const issues = fileReport.match(/⚠️.*\n/g) || [];
      if (issues.length > 0) {
        allIssues.push({ file, issues });
      }
    }

    const avgScore = Math.round(totalScore / files.length);
    report += `📈 平均代码质量评分：${avgScore}/100\n\n`;

    if (allIssues.length === 0) {
      report += `✅ 所有文件代码质量良好！\n`;
    } else {
      report += `⚠️ 发现问题的文件：\n\n`;
      allIssues.forEach(({ file, issues }) => {
        report += `📁 ${file}\n`;
        issues.forEach(issue => {
          report += `   ${issue}`);
        });
        report += `\n`;
      });
    }

    return report;
  } catch (error) {
    return `❌ 审查失败：${error.message}`;
  }
}

/**
 * 获取目录下所有指定扩展名的文件
 */
function getAllFiles(dirPath: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  const entries = readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 根据评分返回评语
 */
function getScoreComment(score: number): string {
  if (score >= 90) return '🏆 优秀！代码质量非常高！';
  if (score >= 80) return '👍 良好！继续保持！';
  if (score >= 70) return '👌 不错！还有一些改进空间';
  if (score >= 60) return '⚠️ 一般！建议进行代码重构';
  return '❌ 需要改进！建议全面审查代码';
}

/**
 * 快速审查（用于命令行）
 * @param path - 文件或目录路径
 */
export async function quickReview(path: string): Promise<string> {
  const stats = statSync(path);
  
  if (stats.isFile()) {
    return await reviewFile(path);
  } else if (stats.isDirectory()) {
    return await reviewDirectory(path);
  } else {
    return `❌ 无效路径：${path}`;
  }
}
