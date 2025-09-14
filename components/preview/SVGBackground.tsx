'use client';

import React, { useEffect, useState } from 'react';
import { SVGData } from '@/types/svg';
import { loadSVGContent } from '@/lib/svg/svg-loader';

interface SVGBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (svgData: SVGData) => void;
}

/**
 * SVG背景组件 - 无损复刻docs/svg.txt的完整设计
 * 使用dangerouslySetInnerHTML确保SVG内容完全不被修改
 */
export default function SVGBackground({ className = '', style, onLoad }: SVGBackgroundProps) {
  const [svgData, setSvgData] = useState<SVGData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        setIsLoading(true);
        const data = await loadSVGContent();
        setSvgData(data);
        onLoad?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    };

    loadSVG();
  }, [onLoad]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center w-[374px] h-[400px] bg-gray-100 ${className}`} style={style}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-gray-600">加载SVG设计...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center w-[374px] h-[400px] bg-red-50 ${className}`} style={style}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ SVG加载失败</div>
          <div className="text-sm text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!svgData) {
    return null;
  }

  return (
    <div 
      className={`svg-background-container ${className}`}
      style={{
        width: svgData.viewBox.width,
        height: svgData.viewBox.height,
        position: 'relative',
        ...style
      }}
    >
      {/* 无损SVG内容渲染 */}
      <div
        className="svg-content w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgData.content }}
      />
    </div>
  );
}

/**
 * SVG样式提取Hook
 * 从SVG定义中提取CSS变量供内容叠加层使用
 */
export function useSVGStyles(svgData: SVGData | null) {
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!svgData) return;

    // 从SVG定义中提取样式信息
    const variables: Record<string, string> = {
      '--svg-width': `${svgData.viewBox.width}px`,
      '--svg-height': `${svgData.viewBox.height}px`,
      // 基础字体样式（需要根据实际SVG内容调整）
      '--svg-font-family': 'system-ui, -apple-system, sans-serif',
      '--svg-font-size': '14px',
      '--svg-line-height': '1.5',
      '--svg-text-color': '#000000'
    };

    setCssVariables(variables);
  }, [svgData]);

  return cssVariables;
}