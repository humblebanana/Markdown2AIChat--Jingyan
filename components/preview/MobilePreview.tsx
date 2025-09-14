'use client';

import React, { useState } from 'react';
import SVGBackground, { useSVGStyles } from './SVGBackground';
import ContentOverlay, { AreaBounds } from './ContentOverlay';
import { SVGData } from '@/types/svg';
import { RenderedElement } from '@/types/markdown';
import { CONTENT_AREAS } from '@/lib/svg/coordinate-mapping';

interface MobilePreviewProps {
  renderedElements: RenderedElement[];
  isLoading?: boolean;
  showDebugBounds?: boolean;
}

type ViewMode = 'single' | 'full';

/**
 * 移动端预览组件 - 集成SVG背景和内容叠加层
 */
export default function MobilePreview({ 
  renderedElements, 
  isLoading = false,
  showDebugBounds = false
}: MobilePreviewProps) {
  const [svgData, setSvgData] = useState<SVGData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const svgStyles = useSVGStyles(svgData);

  const handleSVGLoad = (data: SVGData) => {
    setSvgData(data);
  };

  // 计算预览容器尺寸
  const containerHeight = viewMode === 'single' ? 600 : 800;
  const containerWidth = svgData ? Math.min(svgData.viewBox.width, 374) : 374;

  return (
    <div className="mobile-preview-container bg-gray-50">
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
          {/* 手机框架 */}
          <div 
            className="mobile-frame relative bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: containerWidth,
              height: containerHeight,
              ...svgStyles
            }}
          >
            {/* SVG背景层 */}
            <SVGBackground 
              onLoad={handleSVGLoad}
              style={{ 
                height: viewMode === 'single' ? '100%' : 'auto',
                objectFit: viewMode === 'single' ? 'cover' : 'contain'
              }}
            />
            
            {/* 内容叠加层 */}
            {svgData && (
              <>
                <ContentOverlay
                  elements={renderedElements}
                  svgWidth={svgData.viewBox.width}
                  svgHeight={svgData.viewBox.height}
                />
                
                {/* 调试区域边界 */}
                <AreaBounds
                  areas={Object.values(CONTENT_AREAS)}
                  visible={showDebugBounds}
                />
              </>
            )}
            
            {/* 加载遮罩 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
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
          </div>
          <div>
            {svgData ? `${svgData.viewBox.width} × ${svgData.viewBox.height}` : '加载中...'}
          </div>
        </div>
      </div>
    </div>
  );
}