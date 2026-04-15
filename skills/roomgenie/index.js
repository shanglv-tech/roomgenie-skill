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
      const searchResult = await cliAdapter.searchHotels(result.searchParams);

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
