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
