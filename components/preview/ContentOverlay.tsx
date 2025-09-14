'use client';

import React from 'react';
import { RenderedElement } from '@/types/markdown';
import { generateOverlayStyles } from '@/lib/svg/coordinate-mapping';

interface ContentOverlayProps {
  elements: RenderedElement[];
  svgWidth: number;
  svgHeight: number;
}

/**
 * 内容叠加层 - 在SVG背景上精确定位Markdown内容
 */
export default function ContentOverlay({ elements, svgWidth, svgHeight }: ContentOverlayProps) {
  if (!elements.length) {
    return null;
  }

  return (
    <div
      className="content-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: 'none', // 保持SVG的交互性
        zIndex: 10
      }}
    >
      {elements.map(element => (
        <div
          key={element.id}
          className={`overlay-element overlay-${element.type}`}
          style={{
            ...generateOverlayStyles(element.position),
            pointerEvents: 'auto', // 内容可交互
          }}
          data-element-type={element.type}
          data-target-area={element.targetArea}
        >
          {element.component}
        </div>
      ))}
      
      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            fontSize: '10px',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        >
          {elements.length} 个元素已渲染
        </div>
      )}
    </div>
  );
}

/**
 * 区域边界显示组件（调试用）
 */
export function AreaBounds({ areas, visible = false }: { 
  areas: Array<{ bounds: { x: number, y: number, width: number, height: number }, name: string }>, 
  visible?: boolean 
}) {
  if (!visible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="area-bounds-overlay" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {areas.map((area, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: area.bounds.x,
            top: area.bounds.y,
            width: area.bounds.width,
            height: area.bounds.height,
            border: '1px dashed rgba(255, 0, 0, 0.5)',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            fontSize: '10px',
            color: 'red',
            padding: '2px',
            zIndex: 999
          }}
        >
          {area.name}
        </div>
      ))}
    </div>
  );
}