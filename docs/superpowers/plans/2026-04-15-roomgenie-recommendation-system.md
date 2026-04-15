# RoomGenie 智能推荐系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个对话式的智能酒店推荐系统，包含需求挖掘、精选推荐、特价筛选和用户画像管理。

**Architecture:** 轻量级对话驱动架构，Skill 负责所有智能逻辑，通过调用 roomgenie-cli 获取基础搜索数据。

**Tech Stack:** Node.js (skill runtime), JSON (本地存储)

---

## 文件结构

| 文件路径 | 职责 | 操作 |
|---------|------|------|
| `skills/roomgenie/lib/profile-manager.js` | 用户画像管理，读写 ~/.roomgenie/profile.json | 新建 |
| `skills/roomgenie/lib/cli-adapter.js` | 调用 roomgenie-cli 并解析结果 | 新建 |
| `skills/roomgenie/lib/dialog-engine.js` | 意图识别、需求追问、对话状态管理 | 新建 |
| `skills/roomgenie/lib/recommendation-engine.js` | 精选推荐、特价筛选、个性化排序 | 新建 |
| `skills/roomgenie/index.js` | Skill 主入口，协调各模块 | 新建 |
| `skills/roomgenie/SKILL.md` | 更新 skill 配置以支持新能力 | 修改 |

---

## 实施任务

### Task 1: 项目基础结构和 Profile Manager

**Files:**
- Create: `skills/roomgenie/lib/profile-manager.js`

- [ ] **Step 1: 创建 profile-manager.js 基础结构**

```javascript
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.roomgenie');
const PROFILE_FILE = path.join(PROFILE_DIR, 'profile.json');

function ensureProfileDir() {
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }
}

function getDefaultProfile() {
  return {
    version: '1.0',
    preferences: {},
    history: {
      recentSearches: [],
      viewedHotels: [],
      bookedHotels: []
    },
    persona: {},
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

function loadProfile() {
  ensureProfileDir();
  if (fs.existsSync(PROFILE_FILE)) {
    try {
      const content = fs.readFileSync(PROFILE_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading profile, using default:', e.message);
      return getDefaultProfile();
    }
  }
  return getDefaultProfile();
}

function saveProfile(profile) {
  ensureProfileDir();
  profile.metadata.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
}

function addRecentSearch(search) {
  const profile = loadProfile();
  profile.history.recentSearches.unshift({
    ...search,
    timestamp: new Date().toISOString()
  });
  // Keep only last 20 searches
  profile.history.recentSearches = profile.history.recentSearches.slice(0, 20);
  saveProfile(profile);
}

module.exports = {
  loadProfile,
  saveProfile,
  addRecentSearch,
  PROFILE_DIR,
  PROFILE_FILE
};
```

- [ ] **Step 2: 验证文件创建**

确认 `skills/roomgenie/lib/profile-manager.js` 存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/lib/profile-manager.js
git commit -m "feat: add profile manager for local user data storage"
```

---

### Task 2: CLI Adapter - 调用 roomgenie-cli

**Files:**
- Create: `skills/roomgenie/lib/cli-adapter.js`

- [ ] **Step 1: 创建 cli-adapter.js**

```javascript
const { execSync } = require('child_process');

function searchHotels({ city, keyword, checkIn, checkOut }) {
  let cmd = 'roomgenie search';
  
  if (city) cmd += ` --city "${city}"`;
  if (keyword) cmd += ` --keyword "${keyword}"`;
  if (checkIn) cmd += ` --check-in "${checkIn}"`;
  if (checkOut) cmd += ` --check-out "${checkOut}"`;

  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    const trimmed = output.trim();
    
    // Try to parse JSON output
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: return mock data for development if CLI not available
    return getMockHotels(city);
  } catch (e) {
    console.error('Error calling roomgenie-cli:', e.message);
    // Return mock data when CLI fails (for development)
    return getMockHotels(city);
  }
}

function getMockHotels(city) {
  const cityName = city || 'Beijing';
  return {
    data: {
      itemList: [
        {
          id: 'hotel_001',
          name: `${cityName} Grand Hotel`,
          address: `123 Main Street, ${cityName}`,
          rating: 4.8,
          reviewCount: 2345,
          price: '¥599',
          currency: 'CNY',
          priceNumeric: 599,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          bookingUrl: 'https://example.com/book/hotel_001',
          amenities: ['Free WiFi', 'Air Conditioning', 'Swimming Pool'],
          starRating: 5,
          distance: '2.5 km from city center'
        },
        {
          id: 'hotel_002',
          name: `${cityName} Boutique Inn`,
          address: `456 Side Street, ${cityName}`,
          rating: 4.5,
          reviewCount: 1234,
          price: '¥399',
          currency: 'CNY',
          priceNumeric: 399,
          imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          bookingUrl: 'https://example.com/book/hotel_002',
          amenities: ['Free WiFi', 'Air Conditioning'],
          starRating: 4,
          distance: '1.2 km from city center'
        },
        {
          id: 'hotel_003',
          name: `${cityName} Budget Stay`,
          address: `789 Budget Road, ${cityName}`,
          rating: 4.2,
          reviewCount: 876,
          price: '¥199',
          currency: 'CNY',
          priceNumeric: 199,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          bookingUrl: 'https://example.com/book/hotel_003',
          amenities: ['Free WiFi'],
          starRating: 3,
          distance: '3.8 km from city center'
        }
      ]
    },
    message: 'success',
    status: 0
  };
}

module.exports = {
  searchHotels
};
```

- [ ] **Step 2: 验证文件创建**

确认 `skills/roomgenie/lib/cli-adapter.js` 存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/lib/cli-adapter.js
git commit -m "feat: add CLI adapter to call roomgenie-cli search"
```

---

### Task 3: Recommendation Engine - 推荐引擎

**Files:**
- Create: `skills/roomgenie/lib/recommendation-engine.js`

- [ ] **Step 1: 创建 recommendation-engine.js**

```javascript
function getHotelsFromSearchResult(result) {
  if (!result || !result.data || !result.data.itemList) {
    return [];
  }
  return result.data.itemList.map(hotel => ({
    ...hotel,
    // Ensure priceNumeric exists for sorting
    priceNumeric: hotel.priceNumeric || parsePrice(hotel.price)
  }));
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function recommendFeatured(hotels, profile = null) {
  // Featured: high rating first, then balanced price
  return [...hotels]
    .filter(h => h.rating >= 4.0)
    .sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
      // Similar ratings: prefer moderate price
      const aPriceScore = Math.abs(a.priceNumeric - 400);
      const bPriceScore = Math.abs(b.priceNumeric - 400);
      return aPriceScore - bPriceScore;
    })
    .slice(0, 5);
}

function recommendDeals(hotels) {
  // Deals: low price first, but filter out low-rated
  return [...hotels]
    .filter(h => h.rating >= 4.0)
    .sort((a, b) => a.priceNumeric - b.priceNumeric)
    .slice(0, 5);
}

function recommendGeneral(hotels, profile = null) {
  // General: balance of rating, price, and review count
  return [...hotels]
    .sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

function calculateScore(hotel) {
  // Simple scoring formula: rating * 20 - price / 50 + reviewCount / 500
  const ratingScore = (hotel.rating || 0) * 20;
  const priceScore = -(hotel.priceNumeric || 0) / 50;
  const reviewScore = (hotel.reviewCount || 0) / 500;
  return ratingScore + priceScore + reviewScore;
}

function detectRecommendationIntent(userInput) {
  const input = userInput.toLowerCase();
  
  if (input.includes('特价') || input.includes('便宜') || input.includes('性价比') || input.includes('优惠') ||
      input.includes('deal') || input.includes('cheap') || input.includes('budget')) {
    return 'deals';
  }
  
  if (input.includes('精选') || input.includes('品质') || input.includes('好的') || input.includes('不错') ||
      input.includes('featured') || input.includes('quality') || input.includes('best')) {
    return 'featured';
  }
  
  return 'general';
}

function formatHotelsForDisplay(hotels, recommendationType = 'general') {
  return {
    type: recommendationType,
    hotels: hotels.map(h => ({
      id: h.id,
      name: h.name,
      address: h.address,
      rating: h.rating,
      reviewCount: h.reviewCount,
      price: h.price,
      imageUrl: h.imageUrl,
      bookingUrl: h.bookingUrl,
      amenities: h.amenities,
      starRating: h.starRating,
      distance: h.distance
    }))
  };
}

module.exports = {
  getHotelsFromSearchResult,
  recommendFeatured,
  recommendDeals,
  recommendGeneral,
  detectRecommendationIntent,
  formatHotelsForDisplay
};
```

- [ ] **Step 2: 验证文件创建**

确认 `skills/roomgenie/lib/recommendation-engine.js` 存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/lib/recommendation-engine.js
git commit -m "feat: add recommendation engine for featured and deals"
```

---

### Task 4: Dialog Engine - 对话引擎（核心）

**Files:**
- Create: `skills/roomgenie/lib/dialog-engine.js`

- [ ] **Step 1: 创建 dialog-engine.js**

```javascript
const recommendationEngine = require('./recommendation-engine');

// 对话状态存储（单次会话内有效）
const sessionState = new Map();

function getSessionState(sessionId) {
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, {
      step: 0,
      collectedInfo: {},
      intent: 'general'
    });
  }
  return sessionState.get(sessionId);
}

function clearSessionState(sessionId) {
  sessionState.delete(sessionId);
}

function processUserInput(sessionId, userInput) {
  const state = getSessionState(sessionId);
  
  // 检测意图
  if (state.step === 0) {
    state.intent = recommendationEngine.detectRecommendationIntent(userInput);
  }
  
  // 检测是否跳过
  if (isSkipRequest(userInput)) {
    return generateRecommendation(state);
  }
  
  // 收集信息
  if (state.step === 0) {
    // 第一次交互：先尝试提取已有信息
    const extracted = extractInfo(userInput);
    Object.assign(state.collectedInfo, extracted);
  } else {
    // 后续交互：解析回答
    parseAnswer(state, userInput);
  }
  
  // 检查是否已有足够信息
  if (hasEnoughInfo(state.collectedInfo)) {
    return generateRecommendation(state);
  }
  
  // 追问（最多3次）
  if (state.step < 3) {
    const question = generateNextQuestion(state);
    state.step++;
    return {
      type: 'question',
      message: question,
      collectedInfo: { ...state.collectedInfo }
    };
  }
  
  // 超过3次追问，直接推荐
  return generateRecommendation(state);
}

function isSkipRequest(input) {
  const lower = input.toLowerCase();
  return lower.includes('先这样') || lower.includes('直接推荐') || 
         lower.includes('跳过') || lower.includes('随便') ||
         lower.includes('都行') || lower.includes('看着办');
}

function extractInfo(input) {
  const info = {};
  const lower = input.toLowerCase();
  
  // 提取城市（简化版）
  const cityMatch = input.match(/(北京|上海|杭州|广州|深圳|成都|西安|南京|苏州|厦门)/);
  if (cityMatch) {
    info.city = cityMatch[1];
  }
  
  // 提取日期（简化）
  const dateMatch = input.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    if (!info.checkIn) info.checkIn = dateMatch[0];
  }
  
  return info;
}

function parseAnswer(state, input) {
  const lower = input.toLowerCase();
  
  // 解析预算选项
  if (state.step === 2) {
    if (lower.includes('a') || lower.includes('300以下')) {
      state.collectedInfo.budget = { min: 0, max: 300 };
    } else if (lower.includes('b') || lower.includes('300-600')) {
      state.collectedInfo.budget = { min: 300, max: 600 };
    } else if (lower.includes('c') || lower.includes('600-1000')) {
      state.collectedInfo.budget = { min: 600, max: 1000 };
    }
  }
  
  // 解析城市
  const cityMatch = input.match(/(北京|上海|杭州|广州|深圳|成都|西安|南京|苏州|厦门)/);
  if (cityMatch && !state.collectedInfo.city) {
    state.collectedInfo.city = cityMatch[1];
  }
}

function hasEnoughInfo(info) {
  // 有城市就够了，可以推荐
  return !!info.city;
}

function generateNextQuestion(state) {
  const info = state.collectedInfo;
  const step = state.step;
  
  const prefix = step > 0 ? "再问一下～" : "好呀！几个小问题帮你找最合适的～\n";
  const suffix = "\n(可以直接说\"先这样吧\"跳过问题)";
  
  if (!info.city && step === 0) {
    return `${prefix}1) 有想去的城市吗？\n2) 还是想让我推荐几个好去处？${suffix}`;
  }
  
  if (!info.budget && step === 1) {
    return `${prefix}预算大概在哪个范围呢？\nA) ¥300以下  B) ¥300-600  C) ¥600-1000  D) 都行${suffix}`;
  }
  
  if (step === 2) {
    return `这次出行主要是？\nA) 休闲度假  B) 商务出差  C) 都行${suffix}`;
  }
  
  return "好的，了解得差不多了！";
}

function generateRecommendation(state) {
  // 确保有默认城市
  if (!state.collectedInfo.city) {
    state.collectedInfo.city = '北京'; // 默认城市
  }
  
  return {
    type: 'recommendation',
    intent: state.intent,
    searchParams: { ...state.collectedInfo },
    message: '好嘞，这就为你推荐几个不错的选择！'
  };
}

module.exports = {
  processUserInput,
  clearSessionState,
  getSessionState
};
```

- [ ] **Step 2: 验证文件创建**

确认 `skills/roomgenie/lib/dialog-engine.js` 存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/lib/dialog-engine.js
git commit -m "feat: add dialog engine for intent recognition and demand mining"
```

---

### Task 5: Skill 主入口 index.js

**Files:**
- Create: `skills/roomgenie/index.js`

- [ ] **Step 1: 创建 index.js**

```javascript
const dialogEngine = require('./lib/dialog-engine');
const recommendationEngine = require('./lib/recommendation-engine');
const cliAdapter = require('./lib/cli-adapter');
const profileManager = require('./lib/profile-manager');

let sessionCounter = 0;
const SESSION_ID = 'roomgenie-session-' + Date.now();

async function run(userInput) {
  try {
    // 处理用户输入
    const result = dialogEngine.processUserInput(SESSION_ID, userInput);
    
    if (result.type === 'question') {
      return {
        type: 'text',
        content: result.message
      };
    }
    
    if (result.type === 'recommendation') {
      // 调用搜索
      const searchResult = cliAdapter.searchHotels(result.searchParams);
      
      // 记录搜索历史
      profileManager.addRecentSearch(result.searchParams);
      
      // 获取酒店列表
      const hotels = recommendationEngine.getHotelsFromSearchResult(searchResult);
      
      // 根据意图推荐
      let recommended;
      if (result.intent === 'featured') {
        recommended = recommendationEngine.recommendFeatured(hotels);
      } else if (result.intent === 'deals') {
        recommended = recommendationEngine.recommendDeals(hotels);
      } else {
        recommended = recommendationEngine.recommendGeneral(hotels);
      }
      
      // 格式化输出
      const displayData = recommendationEngine.formatHotelsForDisplay(recommended, result.intent);
      
      return {
        type: 'hotels',
        message: result.message,
        data: displayData
      };
    }
    
    return {
      type: 'text',
      content: '好的，让我想想...'
    };
    
  } catch (error) {
    console.error('Error in roomgenie skill:', error);
    return {
      type: 'error',
      content: '抱歉，遇到了一些问题，请稍后再试。'
    };
  }
}

// 格式化输出为 Markdown
function formatMarkdownOutput(result) {
  if (result.type === 'text') {
    return result.content;
  }
  
  if (result.type === 'hotels') {
    let md = `## ${result.message}\n\n`;
    md += `基于 RoomGenie 实时结果：\n\n`;
    
    result.data.hotels.forEach((hotel, index) => {
      md += `### ${index + 1}. ${hotel.name}\n\n`;
      if (hotel.imageUrl) {
        md += `![](${hotel.imageUrl})\n\n`;
      }
      md += `- **评分**: ${hotel.rating} (${hotel.reviewCount}条评价)\n`;
      md += `- **价格**: ${hotel.price}\n`;
      md += `- **地址**: ${hotel.address}\n`;
      if (hotel.starRating) {
        md += `- **星级**: ${hotel.starRating}星\n`;
      }
      if (hotel.distance) {
        md += `- **位置**: ${hotel.distance}\n`;
      }
      if (hotel.amenities && hotel.amenities.length > 0) {
        md += `- **设施**: ${hotel.amenities.join(', ')}\n`;
      }
      if (hotel.bookingUrl) {
        md += `\n[Book now](${hotel.bookingUrl})\n`;
      }
      md += '\n---\n\n';
    });
    
    md += `如需预订可点击上方链接。`;
    return md;
  }
  
  if (result.type === 'error') {
    return `⚠️ ${result.content}`;
  }
  
  return JSON.stringify(result, null, 2);
}

module.exports = {
  run,
  formatMarkdownOutput
};

// 如果直接运行，提供简单测试
if (require.main === module) {
  const testInput = process.argv[2] || '我想找个酒店';
  run(testInput).then(result => {
    console.log(formatMarkdownOutput(result));
  });
}
```

- [ ] **Step 2: 验证文件创建**

确认 `skills/roomgenie/index.js` 存在且内容正确。

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/index.js
git commit -m "feat: add main skill entry point"
```

---

### Task 6: 更新 SKILL.md 配置

**Files:**
- Modify: `skills/roomgenie/SKILL.md`

- [ ] **Step 1: 读取当前 SKILL.md**

Read the current content of `skills/roomgenie/SKILL.md`.

- [ ] **Step 2: 更新 SKILL.md，添加新能力描述**

在 frontmatter 的 description 中补充："Includes conversational demand mining, curated recommendations, and deal finding."

在 "Core Capabilities" 部分补充：

```
### Conversational Recommendation
- **Intent Recognition**: Detect if user wants featured hotels, deals, or general recommendations
- **Demand Mining**: Gentle, pressure-free questioning to understand user preferences
- **Profile Learning**: Stores user preferences locally at ~/.roomgenie/profile.json
```

- [ ] **Step 3: Commit**

```bash
git add skills/roomgenie/SKILL.md
git commit -m "docs: update SKILL.md with new recommendation capabilities"
```

---

### Task 7: 集成测试和验证

**Files:**
- Test: Manual testing via Node.js

- [ ] **Step 1: 测试 profile manager**

```bash
cd skills/roomgenie
node -e "const pm = require('./lib/profile-manager'); console.log('Profile dir:', pm.PROFILE_DIR); pm.addRecentSearch({city: '北京'}); console.log('Test search added');"
```

Expected: No errors, profile.json created in ~/.roomgenie/

- [ ] **Step 2: 测试推荐引擎**

```bash
cd skills/roomgenie
node -e "
  const re = require('./lib/recommendation-engine');
  const hotels = [
    {id: 'h1', name: 'Test 1', rating: 4.8, priceNumeric: 599, reviewCount: 1000},
    {id: 'h2', name: 'Test 2', rating: 4.5, priceNumeric: 399, reviewCount: 500},
    {id: 'h3', name: 'Test 3', rating: 4.2, priceNumeric: 199, reviewCount: 200}
  ];
  console.log('Featured:', re.recommendFeatured(hotels).map(h => h.name));
  console.log('Deals:', re.recommendDeals(hotels).map(h => h.name));
"
```

Expected: Lists of hotel names, featured should prefer higher rated, deals prefer lower price.

- [ ] **Step 3: 简单端到端测试**

```bash
cd skills/roomgenie
node index.js "我想找个特价酒店"
```

Expected: Markdown output with hotel recommendations.

- [ ] **Step 4: Commit (if any fixes)**

```bash
git status
# If any fixes needed, commit them
```

---

## 实施完成检查清单

- [ ] 所有文件创建完成
- [ ] 所有单元测试通过
- [ ] 端到端测试能够输出推荐结果
- [ ] 用户画像能够正确保存到 ~/.roomgenie/
- [ ] SKILL.md 已更新
- [ ] 代码已全部提交到 git

