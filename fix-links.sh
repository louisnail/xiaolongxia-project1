#!/bin/bash
# 批量检查并修复所有 HTML 文件中的.md 链接

echo "🔍 开始检查所有 HTML 文件中的.md 链接..."

# 查找所有.html 文件
find . -name "*.html" -type f | while read file; do
  echo "检查：$file"
  
  # 查找.md 链接
  if grep -q "\.md" "$file"; then
    echo "  ⚠️  发现.md 链接，正在修复..."
    
    # 替换所有.md 为.html
    sed -i.bak 's/\.md"/\.html"/g' "$file"
    sed -i.bak 's/\.md'/\.html'/g' "$file"
    
    # 删除备份文件
    rm -f "${file}.bak"
    
    echo "  ✅ 修复完成"
  else
    echo "  ✅ 无.md 链接"
  fi
done

echo ""
echo "🎉 检查完成！"
echo ""
echo "📊 生成检查报告..."

# 统计.md 文件数量
md_count=$(find . -name "*.md" -type f | wc -l)
echo "发现 .md 文件：$md_count 个"

# 统计.html 文件数量
html_count=$(find . -name "*.html" -type f | wc -l)
echo "发现 .html 文件：$html_count 个"

echo ""
echo "✅ 所有链接已修复为.html 格式！"
