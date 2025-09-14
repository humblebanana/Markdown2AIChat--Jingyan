'use client';

import React from 'react';
import { RenderedElement } from '@/types/markdown';

interface MobileFrameCSSProps {
  renderedElements: RenderedElement[];
  showDebugBounds?: boolean;
}

/**
 * 纯CSS实现的移动端框架 - 稳定、快速、无闪烁
 * 基于照片分析重建移动端UI，替代复杂的SVG处理
 */
export default function MobileFrameCSS({ renderedElements, showDebugBounds = false }: MobileFrameCSSProps) {
  return (
    <div className="mobile-frame-css" style={{
      width: '374px',
      height: '600px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 顶部状态栏 */}
      <div className="status-bar" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '44px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#000000'
      }}>
        <div>6:18</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* 信号图标 */}
          <div style={{
            width: '18px',
            height: '12px',
            display: 'flex',
            alignItems: 'end',
            gap: '1px'
          }}>
            {[3, 6, 9, 12].map((height, i) => (
              <div key={i} style={{
                width: '3px',
                height: `${height}px`,
                backgroundColor: '#000000',
                borderRadius: '0.5px'
              }} />
            ))}
          </div>
          
          {/* WiFi图标 */}
          <div style={{
            width: '15px',
            height: '15px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '15px',
              height: '15px',
              border: '2px solid #000000',
              borderRadius: '15px 15px 0 0',
              borderBottom: 'none'
            }} />
          </div>
          
          {/* 电池图标 */}
          <div style={{
            width: '25px',
            height: '12px',
            border: '1px solid #000000',
            borderRadius: '2px',
            position: 'relative',
            backgroundColor: '#000000'
          }}>
            <div style={{
              position: 'absolute',
              right: '-2px',
              top: '3px',
              width: '2px',
              height: '6px',
              backgroundColor: '#000000',
              borderRadius: '0 1px 1px 0'
            }} />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="main-content" style={{
        position: 'absolute',
        top: '44px',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '20px',
        overflow: 'auto'
      }}>
        
        {/* 内容区域定义 */}
        <ContentArea 
          id="main-title" 
          bounds={{ x: 0, y: 60, width: 334, height: 50 }}
          elements={renderedElements.filter(el => el.targetArea === 'mainTitle')}
          showBounds={showDebugBounds}
        />
        
        <ContentArea 
          id="subtitle" 
          bounds={{ x: 0, y: 120, width: 334, height: 40 }}
          elements={renderedElements.filter(el => el.targetArea === 'subtitle')}
          showBounds={showDebugBounds}
        />
        
        <ContentArea 
          id="main-content" 
          bounds={{ x: 0, y: 180, width: 334, height: 300 }}
          elements={renderedElements.filter(el => el.targetArea === 'mainContent')}
          showBounds={showDebugBounds}
        />
        
        <ContentArea 
          id="bullet-list" 
          bounds={{ x: 0, y: 500, width: 334, height: 200 }}
          elements={renderedElements.filter(el => el.targetArea === 'bulletList')}
          showBounds={showDebugBounds}
        />
        
        <ContentArea 
          id="table-area" 
          bounds={{ x: 0, y: 720, width: 334, height: 300 }}
          elements={renderedElements.filter(el => el.targetArea === 'tableArea')}
          showBounds={showDebugBounds}
        />
        
        <ContentArea 
          id="numbered-list" 
          bounds={{ x: 0, y: 1040, width: 334, height: 150 }}
          elements={renderedElements.filter(el => el.targetArea === 'numberedList')}
          showBounds={showDebugBounds}
        />
        
      </div>
    </div>
  );
}

/**
 * 内容区域组件
 */
interface ContentAreaProps {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  elements: RenderedElement[];
  showBounds?: boolean;
}

function ContentArea({ id, bounds, elements, showBounds }: ContentAreaProps) {
  return (
    <div 
      className={`content-area-${id}`}
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        ...(showBounds && {
          border: '1px dashed rgba(255, 0, 0, 0.5)',
          backgroundColor: 'rgba(255, 0, 0, 0.05)'
        })
      }}
    >
      {elements.map((element, index) => (
        <div
          key={element.id}
          style={{
            marginBottom: '8px',
            ...getElementPositionStyles(element.type, index)
          }}
        >
          {element.component}
        </div>
      ))}
      
      {showBounds && (
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          fontSize: '10px',
          color: 'red',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '1px 3px',
          borderRadius: '2px'
        }}>
          {id} ({elements.length})
        </div>
      )}
    </div>
  );
}

/**
 * 获取元素位置样式
 */
function getElementPositionStyles(elementType: string, index: number): React.CSSProperties {
  const baseSpacing = index * 4; // 基础间距
  
  switch (elementType) {
    case 'h1':
    case 'h2':
      return { 
        marginBottom: '12px',
        marginTop: baseSpacing
      };
    case 'p':
      return { 
        marginBottom: '10px',
        marginTop: baseSpacing + 2
      };
    case 'ul':
    case 'ol':
      return { 
        marginBottom: '15px',
        marginTop: baseSpacing + 3
      };
    case 'table':
      return { 
        marginBottom: '20px',
        marginTop: baseSpacing + 5
      };
    default:
      return { 
        marginBottom: '8px',
        marginTop: baseSpacing
      };
  }
}