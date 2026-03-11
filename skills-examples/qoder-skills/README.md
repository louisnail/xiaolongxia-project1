# 🛠️ Qoder 编程助手 Skills

为 Qoder CLI 创建的编程相关 Skills 集合，提升开发效率。

## 已创建 Skills

### 1. code-review - 代码审查
- 自动审查代码质量
- 检查最佳实践
- 提供改进建议

### 2. unit-test-gen - 单元测试生成
- 根据代码生成测试用例
- 支持多种测试框架
- 覆盖率达到标

### 3. api-doc-gen - API 文档生成
- 从代码注释生成文档
- 支持 OpenAPI/Swagger
- 自动更新文档

### 4. git-helper - Git 工作流助手
- 自动生成 commit message
- 分支管理建议
- 冲突解决指导

### 5. code-explain - 代码解释
- 解释复杂代码逻辑
- 生成代码注释
- 提供学习资源

### 6. bug-finder - Bug 定位
- 静态代码分析
- 常见错误检测
- 修复建议生成

### 7. refactor-helper - 重构助手
- 代码重构建议
- 设计模式推荐
- 性能优化指导

### 8. dependency-check - 依赖检查
- 检查过期依赖
- 安全漏洞扫描
- 版本兼容性分析

---

## 使用方法

```bash
# 代码审查
qoder skill code-review ./src

# 生成单元测试
qoder skill unit-test-gen ./src/utils.js

# 生成 API 文档
qoder skill api-doc-gen ./api

# Git 助手
qoder skill git-helper commit

# 代码解释
qoder skill code-explain ./complex-function.js

# Bug 定位
qoder skill bug-finder ./src

# 重构建议
qoder skill refactor-helper ./src/legacy-code.js

# 依赖检查
qoder skill dependency-check
```

---

## 安装方式

```bash
# 克隆 Skills 仓库
git clone https://github.com/cchen1-08/openclaw-kb.git
cd openclaw-kb/skills-examples/qoder-skills

# 安装依赖
npm install

# 复制到 Qoder Skills 目录
cp -r * ~/.qoder/skills/
```

---

## 开发计划

- [ ] code-review ✅
- [ ] unit-test-gen ✅
- [ ] api-doc-gen ✅
- [ ] git-helper ✅
- [ ] code-explain ✅
- [ ] bug-finder ✅
- [ ] refactor-helper ✅
- [ ] dependency-check ✅
- [ ] performance-profiler (性能分析)
- [ ] security-scanner (安全扫描)
- [ ] database-helper (数据库助手)
- [ ] docker-helper (Docker 助手)

---

**版本**: v1.0  
**更新**: 2026-03-08  
**维护**: OpenClaw 知识库项目组
