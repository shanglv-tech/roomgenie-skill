# 飞书 CLI vs RoomGenie CLI 对比分析

## 问题概述
我们的 roomgenie-skill 在 Claude Code 中使用时，中文城市名称参数传递出现问题。本文对比分析飞书官方 CLI 的解决方案，找出我们可以借鉴的地方。

---

## 一、飞书 CLI 的设计（Go + Cobra）

### 1.1 技术栈
- **语言**: Go
- **CLI 框架**: Cobra (https://github.com/spf13/cobra)
- **参数处理**: 原生支持 UTF-8

### 1.2 参数读取方式（关键！）

飞书直接从命令行读取参数，**不需要任何 URL-encode/decode**：

```go
// shortcuts/common/runner.go - 第 161-164 行
func (ctx *RuntimeContext) Str(name string) string {
    v, _ := ctx.Cmd.Flags().GetString(name)
    return v
}
```

### 1.3 实际调用示例

```bash
# 发送中文消息 - 直接传中文，无需编码
lark-cli im +messages-send \
  --chat-id oc_xxx \
  --text "今天下午3点开会讨论产品迭代计划"

# 创建中文群名
lark-cli im +chat-create \
  --name "产品研发团队" \
  --description "负责产品迭代和技术研发"
```

### 1.4 为什么飞书不需要编码？

1. **Go 的 Cobra 库原生支持 UTF-8**：命令行参数直接以 UTF-8 字符串传递
2. **没有中间层编码转换**：Claude Code → Shell → Go CLI，参数保持原样
3. **Skill 文档示例明确**：直接展示中文参数调用，没有任何编码提示

---

## 二、我们当前的设计（Node.js + Commander）

### 2.1 技术栈
- **语言**: Node.js
- **CLI 框架**: Commander.js (https://github.com/tj/commander.js/)
- **参数处理**: 尝试了 URL-encode/decode 方案

### 2.2 当前的问题代码

在 `roomgenie-cli/src/commands/search.ts` 中：

```typescript
// 第 30-33 行 - 我们尝试自动 decode
const city = options.city ? decodeURIComponent(options.city) : undefined;
const keyword = options.keyword ? decodeURIComponent(options.keyword) : undefined;
```

**问题**：这个方案假设 Claude Code 会对参数进行 URL-encode，但实际上：
1. Claude Code 不会自动 encode
2. 导致 `decodeURIComponent("北京")` 直接报错

### 2.3 Git 历史显示的尝试

从最近的 commit 可以看到我们尝试了多种方案：

```
2f700da refactor: back to simplest solution - direct roomgenie-cli call
e1250fb feat: add stable cli-wrapper.js for reliable URL-encoding
c1dafdc refactor: remove cli-wrapper.js, instruct Claude Code to encode parameters directly
1add638 feat: add cli-wrapper.js to handle URL-encoding for Chinese parameters
```

---

## 三、核心对比表

| 方面 | 飞书 CLI | 我们的 CLI |
|------|----------|-----------|
| **语言** | Go | Node.js |
| **CLI 框架** | Cobra | Commander.js |
| **中文参数支持** | ✅ 原生支持 | ❌ 需要额外处理 |
| **参数传递方式** | 直接传递 | 尝试 URL-encode/decode |
| **Skill 文档示例** | 直接展示中文 | 尝试 instruct encode |
| **Claude Code 调用** | 简单直接 | 复杂且容易出错 |

---

## 四、关键发现！

### 4.1 Node.js 的 Commander.js 也应该原生支持 UTF-8！

问题**不是** Commander.js 不支持中文，而是：

1. **我们过度设计了**：添加了不必要的 `decodeURIComponent`
2. **Claude Code 调用 Shell 时的参数传递**：这才是真正的问题所在

### 4.2 飞书的 Skill 设计模式

飞书的 Skill 文档有几个重要特点：

1. **清晰的 Shortcut 定义**：
   ```markdown
   ## Shortcuts（推荐优先使用）
   | Shortcut | 说明 |
   |----------|------|
   | [`+messages-send`](references/lark-im-messages-send.md) | Send a message... |
   ```

2. **详细的参考文档**：每个 command 都有单独的 markdown 文件
3. **大量示例**：包含中文参数的真实示例
4. **没有编码说明**：因为不需要！

---

## 五、建议的解决方案

### 方案 A：最简单方案（推荐）⭐

**步骤：**
1. 从 roomgenie-cli 中移除 `decodeURIComponent` 调用
2. 确保 CLI 直接接收 UTF-8 参数
3. 更新 Skill 文档，像飞书那样直接展示中文示例
4. 信任 Node.js + Commander.js 原生处理 UTF-8

**优点**：
- 简单，符合飞书的设计模式
- 减少出错可能
- Skill 文档更清晰

### 方案 B：使用环境变量传递复杂参数

如果 Shell 参数传递确实有问题，可以考虑：
- 通过环境变量传递中文参数
- 或者通过 stdin 传递 JSON 配置

---

## 六、下一步行动

1. **验证假设**：测试 Node.js + Commander.js 直接接收中文参数
2. **简化代码**：移除不必要的 decode 逻辑
3. **更新文档**：参考飞书的 Skill 文档结构
4. **测试完整流程**：Claude Code → Shell → Node.js CLI
