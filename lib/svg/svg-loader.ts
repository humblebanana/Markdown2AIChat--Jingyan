/**
 * SVG加载器 - 处理docs/svg.txt文件
 * 实现无损SVG内容加载和解析
 */

import { createSVGSkeleton } from './svg-skeleton';

export interface SVGData {
  content: string;
  viewBox: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  definitions: {
    clipPaths: Record<string, string>;
    gradients: Record<string, string>;
    filters: Record<string, string>;
  };
}

/**
 * 加载并解析SVG文件
 */
export async function loadSVGContent(): Promise<SVGData> {
  try {
    // 加载SVG文件内容
    const response = await fetch('/svg.txt');
    const svgContent = await response.text();
    
    // 解析viewBox
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const [x, y, width, height] = viewBoxMatch 
      ? viewBoxMatch[1].split(' ').map(Number)
      : [0, 0, 374, 2250];

    // 创建SVG骨架 - 移除所有文本内容
    const skeletonContent = createSVGSkeleton(svgContent);
    
    // 提取定义部分
    const definitions = extractSVGDefinitions(svgContent);

    return {
      content: skeletonContent, // 使用骨架而不是原始内容
      viewBox: { x, y, width, height },
      definitions
    };
  } catch (error) {
    console.error('Failed to load SVG content:', error);
    throw new Error('SVG文件加载失败');
  }
}

/**
 * 提取SVG定义(defs)部分
 */
function extractSVGDefinitions(svgContent: string) {
  const definitions = {
    clipPaths: {} as Record<string, string>,
    gradients: {} as Record<string, string>,
    filters: {} as Record<string, string>
  };

  // 提取clipPath定义
  const clipPathRegex = /<clipPath id="([^"]+)"[^>]*>([\s\S]*?)<\/clipPath>/g;
  let clipPathMatch;
  while ((clipPathMatch = clipPathRegex.exec(svgContent)) !== null) {
    definitions.clipPaths[clipPathMatch[1]] = clipPathMatch[2];
  }

  // 提取linearGradient定义
  const gradientRegex = /<linearGradient[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/linearGradient>/g;
  let gradientMatch;
  while ((gradientMatch = gradientRegex.exec(svgContent)) !== null) {
    definitions.gradients[gradientMatch[1]] = gradientMatch[0];
  }

  // 提取filter定义
  const filterRegex = /<filter[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/filter>/g;
  let filterMatch;
  while ((filterMatch = filterRegex.exec(svgContent)) !== null) {
    definitions.filters[filterMatch[1]] = filterMatch[0];
  }

  return definitions;
}

/**
 * 分析SVG内容区域
 * 基于SVG结构识别可用的内容区域
 */
export interface ContentArea {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'header' | 'content' | 'list' | 'table' | 'footer';
}

export function analyzeContentAreas(svgData: SVGData): ContentArea[] {
  // 基于SVG的374x2250设计，分析内容区域
  // 这些区域需要根据实际SVG设计进行调整
  return [
    {
      id: 'header',
      name: '标题区域',
      bounds: { x: 20, y: 80, width: 334, height: 60 },
      type: 'header'
    },
    {
      id: 'main-content',
      name: '主要内容区域',
      bounds: { x: 20, y: 160, width: 334, height: 800 },
      type: 'content'
    },
    {
      id: 'list-area',
      name: '列表区域',
      bounds: { x: 20, y: 980, width: 334, height: 400 },
      type: 'list'
    },
    {
      id: 'table-area',
      name: '表格区域',
      bounds: { x: 20, y: 1400, width: 334, height: 600 },
      type: 'table'
    }
  ];
}