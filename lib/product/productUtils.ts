import { ProductInfo } from '@/types/product';

/**
 * 根据SKU ID获取模拟商品数据
 */
export function getProductMockData(skuId: string, productName?: string, customPrice?: string): ProductInfo {
  // 根据SKU ID生成模拟数据
  // 可以根据不同的SKU ID返回不同的模拟数据
  const mockData: Record<string, ProductInfo> = {
    '10147798291074': {
      skuId: '10147798291074',
      title: 'iPad Air 4 10.9英寸 WiFi版 64GB 深空灰色 Apple Pencil套装',
      subtitle: '二手95成新，支持Apple Pencil二代',
      price: 1399,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['高性价比', '支持二代笔'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '5000+人种草',
      aiCommentText: '500+评价总结',
      aiCommentCount: '500+评价总结'
    },
    '10030889063079': {
      skuId: '10030889063079',
      title: 'iPad Air 4 10.9英寸 WiFi版 64GB 深空灰色 95新成色',
      subtitle: '95新成色，外观接近全新',
      price: 1683,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['95新', '品质保障'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '3200+人种草',
      aiCommentText: '800+评价总结',
      aiCommentCount: '800+评价总结'
    },
    '10088430135684': {
      skuId: '10088430135684',
      title: 'iPad Pro 11寸 2020款 WiFi版 128GB 深空灰色',
      subtitle: '专业级绘画体验，120Hz ProMotion屏幕',
      price: 2658,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['专业级', '120Hz'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '1500+人种草',
      aiCommentText: '300+评价总结',
      aiCommentCount: '300+评价总结'
    },
    '100077749489': {
      skuId: '100077749489',
      title: '冠能小型犬幼犬粮 400g 高蛋白营养配方',
      subtitle: '蛋白质32%、脂肪20%，营养密度超高',
      price: 14.8,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['性价比首选', '高蛋白'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '900+人种草',
      aiCommentText: '120+评价总结',
      aiCommentCount: '120+评价总结'
    },
    '715880': {
      skuId: '715880',
      title: '皇家小型犬幼犬粮 2kg 专业幼犬配方',
      subtitle: '专为2-10月小型幼犬设计，品牌保障',
      price: 89.9,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['品牌保障', '专业配方'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '2100+人种草',
      aiCommentText: '350+评价总结',
      aiCommentCount: '350+评价总结'
    },
    '3359768': {
      skuId: '3359768',
      title: '黑冰（BLACKICE）户外露营成人P棉睡袋轻量保暖木乃伊式单人睡袋 AT200-天空蓝-L',
      subtitle: '木乃伊式保暖设计，聚酯纤维填充适应秋季温差',
      price: 448,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['户外推荐', '保暖专业'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '700+人种草',
      aiCommentText: '200+评价总结',
      aiCommentCount: '200+评价总结'
    },
    '100004674539': {
      skuId: '100004674539',
      title: '双鲸AD滴剂1岁以下 维生素A维生素D滴剂 50粒装',
      subtitle: '国药准字号，性价比高，50粒装经济实惠选择',
      price: 19.7,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['国药准字', '性价比'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '2800+人种草',
      aiCommentText: '150+评价总结',
      aiCommentCount: '150+评价总结'
    },
    '10153522064737': {
      skuId: '10153522064737',
      title: '五维他口服溶液 B族维生素复合制剂 100ml',
      subtitle: 'B族维生素缺乏引起的厌食、营养不良，液体剂型方便服用',
      price: 18.8,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['液体剂型', '复合维生素'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '1200+人种草',
      aiCommentText: '80+评价总结',
      aiCommentCount: '80+评价总结'
    },
    '100097103444': {
      skuId: '100097103444',
      title: '凯锐思离乳期奶糕 1.5kg 冻干夹心',
      subtitle: '专为1-4月离乳期设计，质地易泡软',
      price: 68.5,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['过渡专家', '易消化'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '1800+人种草',
      aiCommentText: '260+评价总结',
      aiCommentCount: '260+评价总结'
    },
    '10179034851442': {
      skuId: '10179034851442',
      title: '凯乐石软壳冲锋裤 Omni-Tech技术',
      subtitle: '轻薄透气，涤纶+腈纶混纺面料',
      price: 157,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['性价比之选', '轻薄透气'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '650+人种草',
      aiCommentText: '90+评价总结',
      aiCommentCount: '90+评价总结'
    },
    '10163790870156': {
      skuId: '10163790870156',
      title: '始祖鸟BETA冲锋裤 Gore-Tex技术',
      subtitle: '顶级面料，全天候防水防风性能',
      price: 3000,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['专业高端', 'Gore-Tex'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '420+人种草',
      aiCommentText: '60+评价总结',
      aiCommentCount: '60+评价总结'
    },
    'JD_10111994527064': {
      skuId: 'JD_10111994527064',
      title: '啄木鸟黑色缎面衬衫',
      subtitle: '经典商务款式，优质缎面面料，舒适透气',
      price: 299,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['商务正装', '缎面面料'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/10111994527064.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '1200+人种草',
      aiCommentText: '400+评价总结',
      aiCommentCount: '400+评价总结'
    }
  };

  // 获取基础产品数据
  let productData: ProductInfo;
  if (mockData[skuId]) {
    productData = { ...mockData[skuId] };
  } else {
    // 生成通用模拟数据
    productData = {
      skuId,
      title: productName || `商品 SKU: ${skuId}`,
      subtitle: '商品副标题',
      price: 999,
      priceUnit: '¥',
      priceLabel: '到手价',
      tags: ['推荐'],
      aiComment: '评价总结',
      productUrl: `https://item.jd.com/${skuId}.html`,
      brandIconUrl: 'https://img20.360buyimg.com/img/jfs/t1/211566/18/49614/1016/674e83dfF67ae0edd/95c1cb915a0a1a3b.png',
      reason: '700+人种草',
      aiCommentText: '200+评价总结',
      aiCommentCount: '200+评价总结'
    };
  }

  // 如果提供了自定义价格，解析并覆盖默认价格
  if (customPrice) {
    const parsedPrice = parseCustomPrice(customPrice);
    productData.price = parsedPrice.value;
    productData.priceUnit = parsedPrice.unit;
  }

  return productData;
}

/**
 * 预处理Markdown内容，将sku_id标记转换为特殊标记
 */
export function preprocessSkuIds(markdownContent: string): string {
  // 使用正则表达式匹配 <sku_id>数字</sku_id> 格式
  const skuRegex = /<sku_id>(\d+)<\/sku_id>/g;
  
  // 替换为特殊标记，这样在ReactMarkdown中可以被识别
  return markdownContent.replace(skuRegex, (match, skuId) => {
    return `::SKU_CARD::${skuId}::`;
  });
}

/**
 * 检查文本中是否包含SKU卡片标记
 */
export function containsSkuCard(text: string): boolean {
  return text.includes('::SKU_CARD::');
}

/**
 * 从文本中提取SKU ID
 */
export function extractSkuId(text: string): string | null {
  const match = text.match(/::SKU_CARD::(\d+)::/);
  return match ? match[1] : null;
}

/**
 * 分割文本，将SKU卡片标记分离出来
 */
export function splitTextWithSkuCards(text: string): Array<{ type: 'text' | 'sku_card', content: string }> {
  const parts: Array<{ type: 'text' | 'sku_card', content: string }> = [];
  const skuCardRegex = /::SKU_CARD::(\d+)::/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = skuCardRegex.exec(text)) !== null) {
    // 添加SKU卡片之前的文本
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({ type: 'text', content: textBefore });
      }
    }
    
    // 添加SKU卡片
    parts.push({ type: 'sku_card', content: match[1] });
    
    lastIndex = skuCardRegex.lastIndex;
  }
  
  // 添加剩余的文本
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({ type: 'text', content: remainingText });
    }
  }
  
  return parts;
}

/**
 * 价格解析结果接口
 */
export interface ParsedPrice {
  value: number;
  unit: string;
  originalText: string;
}

/**
 * 解析自定义价格参数
 * 支持多种格式：¥299, $29.99, 299元, 15.8, etc.
 */
export function parseCustomPrice(priceText: string): ParsedPrice {
  // 去除首尾空格
  const cleanPrice = priceText.trim();

  // 定义货币符号和单位的映射
  const currencyMap: Record<string, string> = {
    '¥': '¥',
    '￥': '¥',
    '$': '$',
    '€': '€',
    '£': '£',
    '元': '¥',
    'rmb': '¥',
    'RMB': '¥'
  };

  // 正则表达式匹配各种价格格式
  // 匹配: ¥299, $29.99, 299元, 15.8, etc.
  const priceRegex = /^([¥￥$€£]?)\s*(\d+(?:\.\d{1,2})?)\s*(元|rmb|RMB)?$/i;
  const match = cleanPrice.match(priceRegex);

  if (match) {
    const prefix = match[1] || ''; // 前缀符号
    const value = parseFloat(match[2]); // 数值
    const suffix = match[3] || ''; // 后缀单位

    // 确定货币单位
    let unit = '¥'; // 默认单位
    if (prefix && currencyMap[prefix]) {
      unit = currencyMap[prefix];
    } else if (suffix && currencyMap[suffix.toLowerCase()]) {
      unit = currencyMap[suffix.toLowerCase()];
    }

    return {
      value,
      unit,
      originalText: cleanPrice
    };
  }

  // 如果解析失败，尝试提取纯数字
  const numberMatch = cleanPrice.match(/(\d+(?:\.\d{1,2})?)/);
  if (numberMatch) {
    return {
      value: parseFloat(numberMatch[1]),
      unit: '¥', // 默认单位
      originalText: cleanPrice
    };
  }

  // 完全解析失败，返回默认值
  return {
    value: 0,
    unit: '¥',
    originalText: cleanPrice
  };
}