'use client';

import React, { useState } from 'react';
import MobileFrameCSS from './MobileFrameCSS';
import { RenderedElement } from '@/types/markdown';

interface MobilePreviewStableProps {
  renderedElements: RenderedElement[];
  isLoading?: boolean;
  showDebugBounds?: boolean;
}

type ViewMode = 'single' | 'full';

/**
 * 稳定版移动端预览组件 - 使用纯CSS框架，无SVG闪烁问题
 */
export default function MobilePreviewStable({ 
  renderedElements, 
  isLoading = false,
  showDebugBounds = false
}: MobilePreviewStableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  return (
    <div className="mobile-preview-stable bg-gray-50">
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
          <div className="relative">
            {/* CSS移动端框架 - 稳定无闪烁 */}
            <MobileFrameCSS
              renderedElements={renderedElements}
              showDebugBounds={showDebugBounds}
            />
            
            {/* 加载遮罩 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
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
                ✓ 稳定渲染
              </span>
            )}
          </div>
          <div>
            374 × 600 (稳定CSS框架)
          </div>
        </div>
        
        {/* 元素分布统计 */}
        {renderedElements.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {getElementStats(renderedElements)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 获取元素分布统计
 */
function getElementStats(elements: RenderedElement[]): string {
  const stats = elements.reduce((acc, el) => {
    const area = el.targetArea || 'unknown';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(stats)
    .map(([area, count]) => `${getAreaDisplayName(area)}: ${count}`)
    .join(' | ');
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