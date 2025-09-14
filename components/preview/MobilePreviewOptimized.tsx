'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RenderedElement } from '@/types/markdown';
import { getOptimizedSVG } from '@/lib/svg/svg-optimizer';

interface MobilePreviewOptimizedProps {
  renderedElements: RenderedElement[];
  isLoading?: boolean;
  showDebugBounds?: boolean;
}

type ViewMode = 'single' | 'full';

interface OptimizedSVGData {
  background: string;
  definitions: string;
  contentMasks: Record<string, string>;
  metadata: {
    viewBox: { width: number; height: number };
    contentAreas: Record<string, { x: number; y: number; width: number; height: number }>;
  };
}

/**
 * 优化版移动端预览 - 保留SVG视觉效果，解决性能问题
 */
export default function MobilePreviewOptimized({ 
  renderedElements, 
  isLoading = false,
  showDebugBounds = false
}: MobilePreviewOptimizedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [svgData, setSvgData] = useState<OptimizedSVGData | null>(null);
  const [svgLoading, setSvgLoading] = useState(true);
  const [svgError, setSvgError] = useState<string | null>(null);

  // SVG只加载一次，后续使用缓存
  useEffect(() => {
    let mounted = true;
    
    const loadOptimizedSVG = async () => {
      try {
        setSvgLoading(true);
        setSvgError(null);
        
        const optimized = await getOptimizedSVG();
        
        if (mounted) {
          setSvgData(optimized);
          setSvgLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setSvgError(error instanceof Error ? error.message : '未知错误');
          setSvgLoading(false);
        }
      }
    };

    loadOptimizedSVG();
    
    return () => {
      mounted = false;
    };
  }, []); // 只在组件挂载时执行一次

  // 按区域分组元素 - 使用useMemo避免重复计算
  const elementsByArea = useMemo(() => {
    const grouped: Record<string, RenderedElement[]> = {};
    renderedElements.forEach(element => {
      const area = element.targetArea || 'mainContent';
      if (!grouped[area]) grouped[area] = [];
      grouped[area].push(element);
    });
    return grouped;
  }, [renderedElements]);

  if (svgLoading) {
    return (
      <div className="mobile-preview-optimized bg-gray-50 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-sm text-gray-600">正在优化SVG资源...</div>
          <div className="text-xs text-gray-500 mt-1">首次加载需要几秒钟</div>
        </div>
      </div>
    );
  }

  if (svgError) {
    return (
      <div className="mobile-preview-optimized bg-gray-50 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ SVG加载失败</div>
          <div className="text-sm text-red-500">{svgError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-preview-optimized bg-gray-50">
      {/* 预览控制栏 */}
      <div className="preview-controls flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">移动端预览</h3>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              渲染中...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 视图模式切换 */}
          <div className="flex rounded-md border border-gray-300">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 text-sm rounded-l-md ${
                viewMode === 'single' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              单屏
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1 text-sm rounded-r-md border-l border-gray-300 ${
                viewMode === 'full' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              全屏
            </button>
          </div>

          {/* 调试开关 */}
          {process.env.NODE_ENV === 'development' && (
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showDebugBounds}
                onChange={() => {}} // 由父组件控制
                className="mr-1"
              />
              显示区域
            </label>
          )}
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className="preview-content flex-1 p-6 overflow-auto">
        <div className="flex justify-center">
          <div className="relative" style={{
            width: svgData?.metadata.viewBox.width || 374,
            height: viewMode === 'single' ? 600 : (svgData?.metadata.viewBox.height || 2250)
          }}>
            
            {/* SVG背景框架 - 只渲染一次，不再重新加载 */}
            {svgData && (
              <div
                className="svg-background absolute inset-0"
                dangerouslySetInnerHTML={{ __html: svgData.background }}
                style={{ 
                  pointerEvents: 'none',
                  height: viewMode === 'single' ? '600px' : 'auto',
                  overflow: viewMode === 'single' ? 'hidden' : 'visible'
                }}
              />
            )}
            
            {/* 内容叠加层 - 高性能渲染 */}
            <div className="content-overlay absolute inset-0" style={{ zIndex: 10 }}>
              {Object.entries(elementsByArea).map(([areaKey, elements]) => {
                const area = svgData?.metadata.contentAreas[areaKey];
                if (!area) return null;
                
                return (
                  <div
                    key={areaKey}
                    className={`content-area-${areaKey}`}
                    style={{
                      position: 'absolute',
                      left: area.x,
                      top: area.y,
                      width: area.width,
                      height: area.height,
                      ...(showDebugBounds && {
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
                          ...getAreaSpecificStyles(areaKey, index)
                        }}
                      >
                        {element.component}
                      </div>
                    ))}
                    
                    {showDebugBounds && (
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
                        {areaKey} ({elements.length})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* 加载遮罩 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg" style={{ zIndex: 20 }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">正在渲染内容...</div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* 预览信息 */}
      <div className="preview-info border-t border-gray-200 bg-white p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            已渲染 {renderedElements.length} 个元素
            {renderedElements.length > 0 && (
              <span className="ml-2 text-green-600">
                ✓ SVG优化渲染
              </span>
            )}
          </div>
          <div>
            {svgData ? `${svgData.metadata.viewBox.width} × ${svgData.metadata.viewBox.height}` : '加载中...'}
          </div>
        </div>
        
        {/* 元素分布统计 */}
        {renderedElements.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {Object.entries(elementsByArea)
              .map(([area, elements]) => `${getAreaDisplayName(area)}: ${elements.length}`)
              .join(' | ')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 获取区域特定的样式
 */
function getAreaSpecificStyles(areaKey: string, index: number): React.CSSProperties {
  const baseSpacing = index * 6;
  
  switch (areaKey) {
    case 'mainTitle':
      return { marginTop: baseSpacing, marginBottom: '16px' };
    case 'subtitle':  
      return { marginTop: baseSpacing + 4, marginBottom: '12px' };
    case 'mainContent':
      return { marginTop: baseSpacing + 2, marginBottom: '10px' };
    case 'bulletList':
    case 'numberedList':
      return { marginTop: baseSpacing + 3, marginBottom: '12px' };
    case 'tableArea':
      return { marginTop: baseSpacing + 5, marginBottom: '15px' };
    default:
      return { marginTop: baseSpacing, marginBottom: '8px' };
  }
}

/**
 * 区域显示名称映射
 */
function getAreaDisplayName(areaKey: string): string {
  const mapping: Record<string, string> = {
    'mainTitle': '标题',
    'subtitle': '副标题', 
    'mainContent': '内容',
    'bulletList': '列表',
    'tableArea': '表格',
    'numberedList': '编号'
  };
  return mapping[areaKey] || areaKey;
}