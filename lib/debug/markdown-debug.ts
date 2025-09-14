/**
 * Markdown渲染调试工具
 */

import { MarkdownElement, RenderedElement } from '@/types/markdown';

/**
 * 调试Markdown渲染流程
 */
export function debugMarkdownRendering(
  markdownText: string,
  parsedElements: MarkdownElement[],
  renderedElements: RenderedElement[]
) {
  console.group('🔍 Markdown渲染调试');
  
  console.log('📝 输入文本:', markdownText.substring(0, 100) + '...');
  
  console.log('📋 解析结果:', parsedElements.map(el => ({
    id: el.id,
    type: el.type,
    content: el.content.substring(0, 50) + '...',
    hasChildren: !!el.children?.length
  })));
  
  console.log('🎨 渲染结果:', renderedElements.map(el => ({
    id: el.id,
    type: el.type,
    targetArea: el.targetArea,
    position: el.position,
    hasComponent: !!el.component
  })));
  
  // 检查映射问题
  const mappingIssues = parsedElements.filter(parsed => 
    !renderedElements.find(rendered => rendered.id === parsed.id)
  );
  
  if (mappingIssues.length > 0) {
    console.warn('⚠️ 映射失败的元素:', mappingIssues.map(el => ({
      id: el.id,
      type: el.type,
      reason: '可能是getTargetArea返回null'
    })));
  }
  
  console.groupEnd();
}

/**
 * 调试区域映射
 */
export function debugAreaMapping() {
  console.group('🗺️ 区域映射调试');
  
  const { getTargetArea } = require('../svg/coordinate-mapping');
  const { PRECISE_ELEMENT_MAPPING, ACTUAL_CONTENT_AREAS } = require('../svg/svg-skeleton');
  
  console.log('🔗 映射规则:', PRECISE_ELEMENT_MAPPING);
  console.log('📍 内容区域:', Object.keys(ACTUAL_CONTENT_AREAS));
  
  // 测试所有映射
  const testElements = ['h1', 'h2', 'p', 'ul', 'ol', 'table'];
  testElements.forEach(elementType => {
    const targetArea = getTargetArea(elementType);
    console.log(`${elementType} → ${targetArea?.id || 'NULL'}`, {
      mapped: !!targetArea,
      area: targetArea
    });
  });
  
  console.groupEnd();
}