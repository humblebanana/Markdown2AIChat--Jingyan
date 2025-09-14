/**
 * Markdown渲染引擎 - 将解析的Markdown元素渲染为React组件
 */

import React from 'react';
import { MarkdownElement, RenderedElement } from '@/types/markdown';
import { getTargetArea, calculateElementPosition } from '@/lib/svg/coordinate-mapping';

/**
 * 将Markdown元素渲染为React组件
 */
export function renderMarkdownElements(elements: MarkdownElement[]): RenderedElement[] {
  const renderedElements: RenderedElement[] = [];
  
  // 按区域分组处理元素
  const elementsByArea = groupElementsByArea(elements);
  
  Object.entries(elementsByArea).forEach(([areaKey, areaElements]) => {
    areaElements.forEach((element, index) => {
      const targetArea = getTargetArea(element.type);
      if (!targetArea) return;

      const position = calculateElementPosition(
        element.type,
        targetArea,
        index,
        areaElements.length
      );

      const component = createElementComponent(element);
      
      renderedElements.push({
        id: element.id,
        type: element.type,
        content: element.content,
        component,
        position,
        targetArea: areaKey,
        children: element.children?.map(child => ({
          id: child.id,
          type: child.type,
          content: child.content,
          component: createElementComponent(child),
          position: { x: 0, y: 0, width: 0, height: 0, zIndex: 0 },
          targetArea: areaKey
        }))
      });
    });
  });

  return renderedElements;
}

/**
 * 按目标区域对元素进行分组
 */
function groupElementsByArea(elements: MarkdownElement[]): Record<string, MarkdownElement[]> {
  const grouped: Record<string, MarkdownElement[]> = {};

  elements.forEach(element => {
    const targetArea = getTargetArea(element.type);
    if (targetArea) {
      const areaKey = targetArea.id;
      if (!grouped[areaKey]) {
        grouped[areaKey] = [];
      }
      grouped[areaKey].push(element);
    }
  });

  return grouped;
}

/**
 * 为Markdown元素创建React组件
 */
function createElementComponent(element: MarkdownElement): React.ReactNode {
  const baseProps = {
    key: element.id,
    className: `markdown-${element.type}`,
    style: getElementStyles(element.type)
  };

  switch (element.type) {
    case 'h1':
      return React.createElement('h1', baseProps, element.content);
    
    case 'h2':
      return React.createElement('h2', baseProps, element.content);
    
    case 'h3':
      return React.createElement('h3', baseProps, element.content);
    
    case 'h4':
      return React.createElement('h4', baseProps, element.content);
    
    case 'h5':
      return React.createElement('h5', baseProps, element.content);
    
    case 'h6':
      return React.createElement('h6', baseProps, element.content);
    
    case 'p':
      return React.createElement('p', baseProps, element.content);
    
    case 'blockquote':
      return React.createElement('blockquote', {
        ...baseProps,
        style: {
          ...baseProps.style,
          borderLeft: '4px solid #e5e7eb',
          paddingLeft: '16px',
          margin: '16px 0',
          fontStyle: 'italic'
        }
      }, element.content);
    
    case 'ul':
      return React.createElement('div', baseProps, 
        element.children?.map((child, index) => 
          React.createElement('div', { 
            key: child.id,
            style: {
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '6px',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }, [
            React.createElement('span', {
              key: 'bullet',
              style: {
                color: '#666666',
                marginRight: '8px',
                fontSize: '16px',
                lineHeight: '1.4',
                flexShrink: 0
              }
            }, '•'),
            React.createElement('span', {
              key: 'content',
              style: { flex: 1 }
            }, child.content)
          ])
        )
      );
    
    case 'ol':
      return React.createElement('div', baseProps,
        element.children?.map((child, index) => 
          React.createElement('div', { 
            key: child.id,
            style: {
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '6px',
              fontSize: '14px',
              lineHeight: '1.6'
            }
          }, [
            React.createElement('span', {
              key: 'number',
              style: {
                color: '#666666',
                marginRight: '8px',
                fontSize: '14px',
                fontWeight: '500',
                flexShrink: 0,
                minWidth: '16px'
              }
            }, `${index + 1}.`),
            React.createElement('span', {
              key: 'content',
              style: { flex: 1 }
            }, child.content)
          ])
        )
      );
    
    case 'table':
      return createTableComponent(element, baseProps);
    
    default:
      return React.createElement('div', baseProps, element.content);
  }
}

/**
 * 创建表格组件
 */
function createTableComponent(element: MarkdownElement, baseProps: any) {
  const { columns = [], rows = [] } = element.metadata || {};
  
  return React.createElement('div', {
    ...baseProps,
    className: `${baseProps.className} table-container`,
    style: {
      ...baseProps.style,
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    }
  }, [
    // 表头
    React.createElement('div', {
      key: 'header',
      className: 'table-header',
      style: {
        display: 'flex',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }
    }, columns.map((col, index) => 
      React.createElement('div', {
        key: `header-${index}`,
        className: 'table-cell-header',
        style: {
          flex: 1,
          padding: '12px 8px',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderRight: index < columns.length - 1 ? '1px solid #e5e7eb' : 'none'
        }
      }, col)
    )),
    
    // 表格行
    ...rows.map((row, rowIndex) => 
      React.createElement('div', {
        key: `row-${rowIndex}`,
        className: 'table-row',
        style: {
          display: 'flex',
          borderBottom: rowIndex < rows.length - 1 ? '1px solid #e5e7eb' : 'none'
        }
      }, row.map((cell, cellIndex) => 
        React.createElement('div', {
          key: `cell-${rowIndex}-${cellIndex}`,
          className: 'table-cell',
          style: {
            flex: 1,
            padding: '8px',
            fontSize: '11px',
            textAlign: 'center',
            borderRight: cellIndex < row.length - 1 ? '1px solid #e5e7eb' : 'none'
          }
        }, cell)
      ))
    )
  ]);
}

/**
 * 获取元素样式 - 优化移动端显示
 */
function getElementStyles(elementType: string): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    color: '#333333',
    lineHeight: '1.6',
    wordBreak: 'break-word',
    textAlign: 'left'
  };

  switch (elementType) {
    case 'h1':
      return {
        ...baseStyles,
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '10px',
        color: '#222222'
      };
    
    case 'h2':
      return {
        ...baseStyles,
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333333'
      };
    
    case 'h3':
      return {
        ...baseStyles,
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '6px',
        color: '#444444'
      };
    
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        ...baseStyles,
        fontSize: '15px',
        fontWeight: '500',
        marginBottom: '4px'
      };
    
    case 'p':
      return {
        ...baseStyles,
        fontSize: '14px',
        lineHeight: '1.7',
        marginBottom: '12px',
        textIndent: '0'
      };
    
    case 'ul':
    case 'ol':
      return {
        ...baseStyles,
        fontSize: '14px',
        lineHeight: '1.6',
        paddingLeft: '0',
        listStyle: 'none'
      };
    
    case 'table':
      return {
        ...baseStyles,
        fontSize: '12px',
        width: '100%',
        borderCollapse: 'collapse'
      };
    
    case 'blockquote':
      return {
        ...baseStyles,
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#666666',
        backgroundColor: '#f8f9fa',
        padding: '8px 12px',
        borderRadius: '4px'
      };
    
    default:
      return baseStyles;
  }
}