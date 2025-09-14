import { ProductInfo } from '@/types/product';
import { getRandomProductImage } from './productImages';

/**
 * 根据SKU ID获取模拟商品数据
 */
export function getProductMockData(skuId: string, productName?: string): ProductInfo {
  // 根据SKU ID生成模拟数据
  // 可以根据不同的SKU ID返回不同的模拟数据
  const mockData: Record<string, ProductInfo> = {
    '10147798291074': {
      skuId: '10147798291074',
      title: 'iPad Air 4 10.9英寸 WiFi版 64GB 深空灰色 Apple Pencil套装',
      subtitle: '二手95成新，支持Apple Pencil二代',
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/331634/18/10698/71790/68be7999Fa866ea4a/661b2ee3764b7cbd.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
      imageUrl: 'https://img13.360buyimg.com/n1/jfs/t1/317792/26/22946/427772/68942d1eF8f1d2950/684bf2cc9e1f8d78.jpg',
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
    }
  };

  // 如果有预设数据，使用随机图片更新预设数据
  if (mockData[skuId]) {
    const productData = { ...mockData[skuId] };
    // 使用SKU ID作为种子生成稳定的随机图片
    productData.imageUrl = getRandomProductImage(skuId);
    return productData;
  }

  // 生成通用模拟数据，使用随机图片
  return {
    skuId,
    title: productName || `商品 SKU: ${skuId}`,
    subtitle: '商品副标题',
    imageUrl: getRandomProductImage(skuId + (productName || '')), // 使用SKU+名称作为随机种子
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