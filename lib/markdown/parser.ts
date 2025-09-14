/**
 * Markdown解析器 - 标准化解析Markdown内容
 */

import { MarkdownElement, ParsedMarkdown } from '@/types/markdown';

/**
 * 解析Markdown内容为结构化元素
 */
export function parseMarkdownContent(markdown: string): ParsedMarkdown {
  const lines = markdown.split('\n');
  const elements: MarkdownElement[] = [];
  let currentElement: MarkdownElement | null = null;
  let elementCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行
    if (!line) {
      if (currentElement && currentElement.type === 'p') {
        // 段落遇到空行结束
        if (currentElement.content.trim()) {
          elements.push(currentElement);
        }
        currentElement = null;
      }
      continue;
    }

    // 解析标题
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      if (currentElement) {
        elements.push(currentElement);
      }
      const level = headerMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      currentElement = {
        id: `element-${++elementCounter}`,
        type: `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
        content: headerMatch[2],
        metadata: { level }
      };
      elements.push(currentElement);
      currentElement = null;
      continue;
    }

    // 解析无序列表
    const ulMatch = line.match(/^[*\-+]\s+(.+)$/);
    if (ulMatch) {
      if (currentElement?.type !== 'ul') {
        if (currentElement) elements.push(currentElement);
        currentElement = {
          id: `element-${++elementCounter}`,
          type: 'ul',
          content: '',
          children: [],
          metadata: { ordered: false }
        };
      }
      currentElement.children!.push({
        id: `li-${elementCounter}-${currentElement.children!.length}`,
        type: 'p',
        content: ulMatch[1]
      });
      continue;
    }

    // 解析有序列表
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (currentElement?.type !== 'ol') {
        if (currentElement) elements.push(currentElement);
        currentElement = {
          id: `element-${++elementCounter}`,
          type: 'ol',
          content: '',
          children: [],
          metadata: { ordered: true }
        };
      }
      currentElement.children!.push({
        id: `li-${elementCounter}-${currentElement.children!.length}`,
        type: 'p',
        content: olMatch[1]
      });
      continue;
    }

    // 解析表格
    if (line.includes('|')) {
      if (currentElement?.type !== 'table') {
        if (currentElement) elements.push(currentElement);
        currentElement = {
          id: `element-${++elementCounter}`,
          type: 'table',
          content: '',
          metadata: { columns: [], rows: [] }
        };
      }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      
      // 检查是否是分隔行
      if (cells.every(cell => /^:?-+:?$/.test(cell))) {
        continue; // 跳过表格分隔行
      }
      
      if (!currentElement.metadata!.columns!.length) {
        // 第一行作为表头
        currentElement.metadata!.columns = cells;
      } else {
        // 数据行
        currentElement.metadata!.rows!.push(cells);
      }
      continue;
    }

    // 解析引用
    const blockquoteMatch = line.match(/^>\s*(.+)$/);
    if (blockquoteMatch) {
      if (currentElement?.type !== 'blockquote') {
        if (currentElement) elements.push(currentElement);
        currentElement = {
          id: `element-${++elementCounter}`,
          type: 'blockquote',
          content: blockquoteMatch[1]
        };
      } else {
        currentElement.content += '\n' + blockquoteMatch[1];
      }
      continue;
    }

    // 普通段落
    if (currentElement?.type !== 'p') {
      if (currentElement) elements.push(currentElement);
      currentElement = {
        id: `element-${++elementCounter}`,
        type: 'p',
        content: line
      };
    } else {
      currentElement.content += '\n' + line;
    }
  }

  // 添加最后一个元素
  if (currentElement && currentElement.content.trim()) {
    elements.push(currentElement);
  }

  // 计算统计信息
  const wordCount = calculateWordCount(markdown);
  const readingTime = Math.ceil(wordCount / 200); // 假设每分钟200字

  return {
    elements,
    wordCount,
    readingTime
  };
}

/**
 * 计算字符数（中英文混合）
 */
function calculateWordCount(text: string): number {
  // 移除markdown标记
  const cleanText = text
    .replace(/#{1,6}\s+/g, '') // 标题标记
    .replace(/[*\-+]\s+/g, '') // 列表标记
    .replace(/\d+\.\s+/g, '') // 有序列表标记
    .replace(/>\s*/g, '') // 引用标记
    .replace(/\|/g, '') // 表格分隔符
    .replace(/[*_`]/g, ''); // 格式化标记

  // 计算中文字符
  const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
  
  // 计算英文单词
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fff]/g, '') // 移除中文
    .split(/\s+/)
    .filter(word => word.trim().length > 0).length;

  return chineseChars + englishWords;
}

/**
 * 验证Markdown语法
 */
export function validateMarkdownSyntax(markdown: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检查标题语法
    const headerMatch = line.match(/^(#{1,6})\s*(.*)$/);
    if (headerMatch && !headerMatch[2].trim()) {
      errors.push(`第${i + 1}行: 标题内容不能为空`);
    }

    // 检查列表缩进
    const listMatch = line.match(/^(\s*)([*\-+]|\d+\.)\s+(.*)$/);
    if (listMatch && listMatch[1].length % 2 !== 0) {
      errors.push(`第${i + 1}行: 列表缩进应为2的倍数`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}