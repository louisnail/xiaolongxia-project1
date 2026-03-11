// file-processor Skill - 文件处理示例
// 展示文件读取、格式转换、批量处理等实用功能

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

/**
 * 读取文件内容
 * @param filePath - 文件路径
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    if (!existsSync(filePath)) {
      return `❌ 文件不存在：${filePath}`;
    }
    
    const content = readFileSync(filePath, 'utf-8');
    const size = statSync(filePath).size;
    const lines = content.split('\n').length;
    
    return `📄 文件：${filePath}\n` +
           `大小：${(size / 1024).toFixed(2)} KB\n` +
           `行数：${lines}\n\n` +
           `--- 内容预览（前 500 字）---\n` +
           `${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
  } catch (error) {
    return `❌ 读取失败：${error.message}`;
  }
}

/**
 * 列出目录内容
 * @param dirPath - 目录路径
 * @param recursive - 是否递归
 */
export async function listDirectory(dirPath: string, recursive: boolean = false): Promise<string> {
  try {
    if (!existsSync(dirPath)) {
      return `❌ 目录不存在：${dirPath}`;
    }
    
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    const lines = items.map(item => {
      const icon = item.isDirectory() ? '📁' : '📄';
      const size = item.isFile() 
        ? ` (${(statSync(join(dirPath, item.name)).size / 1024).toFixed(1)} KB)` 
        : '';
      return `${icon} ${item.name}${size}`;
    });
    
    if (recursive) {
      // 递归处理子目录
      for (const item of items) {
        if (item.isDirectory()) {
          const subPath = join(dirPath, item.name);
          const subItems = await listDirectory(subPath, true);
          lines.push(`\n  ${subItems}`);
        }
      }
    }
    
    return `📂 目录：${dirPath}\n\n${lines.join('\n')}\n\n共 ${items.length} 项`;
  } catch (error) {
    return `❌ 列出失败：${error.message}`;
  }
}

/**
 * 批量转换文件格式
 * @param dirPath - 目录路径
 * @param fromExt - 源扩展名
 * @param toExt - 目标扩展名
 */
export async function convertFiles(
  dirPath: string, 
  fromExt: string, 
  toExt: string
): Promise<string> {
  try {
    const items = readdirSync(dirPath);
    let converted = 0;
    let errors = 0;
    const results = [];
    
    for (const item of items) {
      if (item.endsWith(fromExt)) {
        const srcPath = join(dirPath, item);
        const destPath = srcPath.replace(fromExt, toExt);
        
        try {
          // 简单复制内容（实际应根据格式转换）
          const content = readFileSync(srcPath, 'utf-8');
          writeFileSync(destPath, content, 'utf-8');
          
          results.push(`✅ ${item} → ${destPath.replace(dirPath + '/', '')}`);
          converted++;
        } catch (error) {
          results.push(`❌ ${item}: ${error.message}`);
          errors++;
        }
      }
    }
    
    return `🔄 批量转换完成\n\n` +
           `成功：${converted}\n` +
           `失败：${errors}\n\n` +
           results.join('\n');
  } catch (error) {
    return `❌ 转换失败：${error.message}`;
  }
}

/**
 * 统计文件信息
 * @param dirPath - 目录路径
 */
export async function countFiles(dirPath: string): Promise<string> {
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    
    const stats = {
      files: 0,
      directories: 0,
      totalSize: 0,
      byExtension: {} as Record<string, number>
    };
    
    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      
      if (item.isFile()) {
        stats.files++;
        const size = statSync(fullPath).size;
        stats.totalSize += size;
        
        const ext = extname(item.name).toLowerCase() || '无扩展名';
        stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;
      } else if (item.isDirectory()) {
        stats.directories++;
      }
    }
    
    const extLines = Object.entries(stats.byExtension)
      .sort((a, b) => b[1] - a[1])
      .map(([ext, count]) => `  ${ext}: ${count} 个文件`)
      .join('\n');
    
    return `📊 文件统计\n\n` +
           `文件数：${stats.files}\n` +
           `目录数：${stats.directories}\n` +
           `总大小：${(stats.totalSize / 1024).toFixed(2)} KB\n\n` +
           `按扩展名统计：\n${extLines}`;
  } catch (error) {
    return `❌ 统计失败：${error.message}`;
  }
}

/**
 * 搜索文件内容
 * @param dirPath - 目录路径
 * @param keyword - 搜索关键词
 * @param fileExt - 文件扩展名（可选）
 */
export async function searchInFiles(
  dirPath: string, 
  keyword: string, 
  fileExt?: string
): Promise<string> {
  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    const results = [];
    
    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      
      if (!item.isFile()) continue;
      if (fileExt && !item.name.endsWith(fileExt)) continue;
      
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
              file: item.name,
              line: i + 1,
              content: lines[i].trim().substring(0, 100)
            });
          }
        }
      } catch (error) {
        // 跳过无法读取的文件
      }
    }
    
    if (results.length === 0) {
      return `🔍 未找到包含"${keyword}"的内容`;
    }
    
    const resultLines = results.map(r => 
      `📄 ${r.file}:${r.line}\n   ${r.content}`
    );
    
    return `🔍 找到 ${results.length} 处匹配：\n\n${resultLines.join('\n\n')}`;
  } catch (error) {
    return `❌ 搜索失败：${error.message}`;
  }
}

/**
 * 创建文件备份
 * @param filePath - 文件路径
 */
export async function backupFile(filePath: string): Promise<string> {
  try {
    if (!existsSync(filePath)) {
      return `❌ 文件不存在：${filePath}`;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    const content = readFileSync(filePath, 'utf-8');
    writeFileSync(backupPath, content, 'utf-8');
    
    return `✅ 已创建备份：${backupPath}`;
  } catch (error) {
    return `❌ 备份失败：${error.message}`;
  }
}

/**
 * 合并文件
 * @param files - 文件路径列表
 * @param outputPath - 输出文件路径
 */
export async function mergeFiles(files: string[], outputPath: string): Promise<string> {
  try {
    let mergedContent = '';
    
    for (const file of files) {
      if (!existsSync(file)) {
        return `❌ 文件不存在：${file}`;
      }
      
      const content = readFileSync(file, 'utf-8');
      mergedContent += `// === ${file} ===\n\n${content}\n\n`;
    }
    
    // 确保输出目录存在
    const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
    if (outputDir && !existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    writeFileSync(outputPath, mergedContent, 'utf-8');
    
    return `✅ 已合并 ${files.length} 个文件到：${outputPath}\n` +
           `总大小：${(mergedContent.length / 1024).toFixed(2)} KB`;
  } catch (error) {
    return `❌ 合并失败：${error.message}`;
  }
}
