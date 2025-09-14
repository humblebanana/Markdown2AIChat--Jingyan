/**
 * SVG骨架处理器 - 将现有SVG转换为空白骨架
 * 移除所有文本内容，只保留UI框架
 */

import { SVGData } from '@/types/svg';

/**
 * 处理SVG内容，移除文本元素创建骨架
 */
export function createSVGSkeleton(originalSvgContent: string): string {
  let skeletonContent = originalSvgContent;

  // 移除所有text元素及其内容
  skeletonContent = skeletonContent.replace(/<text[^>]*>[\s\S]*?<\/text>/gi, '');
  
  // 移除所有tspan元素及其内容
  skeletonContent = skeletonContent.replace(/<tspan[^>]*>[\s\S]*?<\/tspan>/gi, '');
  
  // 移除包含中文文本的元素（可能是直接在其他元素中的文本）
  skeletonContent = skeletonContent.replace(/>[\s]*[\u4e00-\u9fff][\s\S]*?</g, '><');
  
  // 移除包含英文文本的普通文本节点，但保留属性值
  skeletonContent = skeletonContent.replace(/>[\s]*[a-zA-Z0-9\s,.:;!?()]+[\s]*</g, '><');

  return skeletonContent;
}

/**
 * 基于照片分析的实际内容区域坐标
 * 根据您提供的照片，重新定义准确的区域位置
 */
export const ACTUAL_CONTENT_AREAS = {
  // 顶部状态栏 (6:18, 信号, 电池)
  statusBar: {
    id: 'status-bar',
    name: '状态栏',
    bounds: { x: 20, y: 50, width: 334, height: 30 },
    type: 'header' as const
  },
  
  // 主标题区域 ("为什么小朋友喜欢吃糖?")
  mainTitle: {
    id: 'main-title',
    name: '主标题',
    bounds: { x: 40, y: 120, width: 290, height: 50 },
    type: 'header' as const
  },
  
  // 子标题区域 ("生理因素", "怎样让小朋友...")
  subtitle: {
    id: 'subtitle',
    name: '子标题',
    bounds: { x: 40, y: 180, width: 290, height: 40 },
    type: 'header' as const
  },
  
  // 主要段落内容区域
  mainContent: {
    id: 'main-content',
    name: '主要内容',
    bounds: { x: 40, y: 240, width: 290, height: 300 },
    type: 'content' as const
  },
  
  // 列表区域 (bullet points)
  bulletList: {
    id: 'bullet-list',
    name: '项目列表',
    bounds: { x: 50, y: 560, width: 280, height: 200 },
    type: 'list' as const
  },
  
  // 表格区域
  tableArea: {
    id: 'table-area',
    name: '产品表格',
    bounds: { x: 40, y: 780, width: 290, height: 300 },
    type: 'table' as const
  },
  
  // 编号列表区域 ("1. 雀巢超启能恩4段")
  numberedList: {
    id: 'numbered-list',
    name: '编号列表',
    bounds: { x: 40, y: 1100, width: 290, height: 150 },
    type: 'list' as const
  },
  
  // 底部导航栏
  bottomNav: {
    id: 'bottom-nav',
    name: '底部导航',
    bounds: { x: 0, y: 2170, width: 374, height: 80 },
    type: 'footer' as const
  }
};

/**
 * 更精确的元素映射规则 - 基于实际布局
 */
export const PRECISE_ELEMENT_MAPPING = {
  // 标题映射
  'h1': 'mainTitle',
  'h2': 'subtitle', 
  'h3': 'subtitle',
  'h4': 'mainContent',
  'h5': 'mainContent',
  'h6': 'mainContent',
  
  // 内容映射
  'p': 'mainContent',
  'blockquote': 'mainContent',
  
  // 列表映射 - 区分有序和无序
  'ul': 'bulletList',
  'ol': 'numberedList',
  
  // 表格映射
  'table': 'tableArea'
} as const;

/**
 * 计算元素在具体区域内的精确位置
 */
export function calculatePrecisePosition(
  elementType: string,
  areaKey: string,
  elementIndex: number,
  totalElements: number
) {
  const area = ACTUAL_CONTENT_AREAS[areaKey as keyof typeof ACTUAL_CONTENT_AREAS];
  if (!area) return null;

  const { bounds } = area;
  
  // 根据元素类型设定不同的高度和间距
  const elementSpecs = {
    'h1': { height: 35, spacing: 10 },
    'h2': { height: 25, spacing: 8 },
    'h3': { height: 20, spacing: 6 },
    'p': { height: 60, spacing: 12 },
    'ul': { height: 80, spacing: 10 },
    'ol': { height: 80, spacing: 10 },
    'table': { height: 250, spacing: 15 },
    'blockquote': { height: 50, spacing: 8 }
  };

  const spec = elementSpecs[elementType as keyof typeof elementSpecs] || 
               { height: 40, spacing: 8 };

  // 在区域内垂直排列
  const y = bounds.y + (elementIndex * (spec.height + spec.spacing));
  
  // 确保不超出区域边界
  const finalY = Math.min(y, bounds.y + bounds.height - spec.height);

  return {
    x: bounds.x + 5, // 小边距
    y: finalY,
    width: bounds.width - 10, // 留出边距
    height: spec.height,
    zIndex: 10
  };
}