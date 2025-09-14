/**
 * 坐标映射系统 - Markdown元素到SVG区域的精确映射
 */

import { ContentArea } from '@/types/svg';
import { ACTUAL_CONTENT_AREAS, PRECISE_ELEMENT_MAPPING, calculatePrecisePosition } from './svg-skeleton';

/**
 * SVG设计规范 - 基于374x2250px的移动端设计
 */
export const SVG_VIEWPORT = {
  width: 374,
  height: 2250
} as const;

/**
 * 使用实际分析得出的内容区域
 */
export const CONTENT_AREAS = ACTUAL_CONTENT_AREAS;

/**
 * Markdown元素类型映射到内容区域
 */
export interface MarkdownElementMapping {
  elementType: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'ul' | 'ol' | 'table' | 'blockquote';
  targetArea: keyof typeof CONTENT_AREAS;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * Markdown元素到SVG区域的映射规则
 */
export const ELEMENT_MAPPING_RULES: MarkdownElementMapping[] = [
  // 标题映射到标题区域
  { elementType: 'h1', targetArea: 'mainTitle', priority: 1 },
  { elementType: 'h2', targetArea: 'subtitle', priority: 2 },
  { elementType: 'h3', targetArea: 'mainContent', priority: 1 },
  { elementType: 'h4', targetArea: 'mainContent', priority: 2 },
  { elementType: 'h5', targetArea: 'mainContent', priority: 3 },
  { elementType: 'h6', targetArea: 'mainContent', priority: 4 },
  
  // 段落映射到主内容区域
  { elementType: 'p', targetArea: 'mainContent', priority: 5 },
  { elementType: 'blockquote', targetArea: 'mainContent', priority: 6 },
  
  // 列表映射到列表区域
  { elementType: 'ul', targetArea: 'bulletList', priority: 1 },
  { elementType: 'ol', targetArea: 'numberedList', priority: 2 },
  
  // 表格映射到表格区域
  { elementType: 'table', targetArea: 'tableArea', priority: 1 }
];

/**
 * 根据Markdown元素类型获取目标区域 - 使用精确映射
 */
export function getTargetArea(elementType: string): ContentArea | null {
  const areaKey = PRECISE_ELEMENT_MAPPING[elementType as keyof typeof PRECISE_ELEMENT_MAPPING];
  return areaKey ? CONTENT_AREAS[areaKey] : null;
}

/**
 * 计算元素在SVG坐标系中的绝对位置
 */
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export function calculateElementPosition(
  elementType: string,
  contentArea: ContentArea,
  elementIndex: number,
  totalElements: number
): ElementPosition {
  // 使用精确的位置计算
  const precisePosition = calculatePrecisePosition(
    elementType,
    contentArea.id,
    elementIndex,
    totalElements
  );
  
  if (precisePosition) {
    return precisePosition;
  }
  
  // 降级到基础计算（保持原有逻辑作为后备）
  const { bounds } = contentArea;
  const elementHeight = 40;
  const y = bounds.y + (elementIndex * (elementHeight + 16));
  
  return {
    x: bounds.x + 5,
    y: Math.min(y, bounds.y + bounds.height - elementHeight),
    width: bounds.width - 10,
    height: elementHeight,
    zIndex: 10
  };
}

/**
 * 生成用于内容叠加的CSS样式
 */
export function generateOverlayStyles(position: ElementPosition): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${position.width}px`,
    minHeight: `${position.height}px`,
    zIndex: position.zIndex,
    // 确保文本可读性
    color: 'var(--svg-text-color, #000000)',
    fontSize: 'var(--svg-font-size, 14px)',
    lineHeight: 'var(--svg-line-height, 1.5)',
    fontFamily: 'var(--svg-font-family, system-ui, -apple-system, sans-serif)'
  };
}

/**
 * 验证坐标是否在SVG视口内
 */
export function isValidPosition(position: ElementPosition): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= SVG_VIEWPORT.width &&
    position.y + position.height <= SVG_VIEWPORT.height
  );
}