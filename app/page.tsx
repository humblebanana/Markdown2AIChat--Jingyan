'use client';

import React, { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { domToCanvas } from 'modern-screenshot';
import InputPanel from '@/components/input/InputPanel';
import MobilePreviewHTML from '@/components/preview/MobilePreviewHTML';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { parseMarkdownContent } from '@/lib/markdown/parser';
import { renderMarkdownElements } from '@/lib/markdown/renderer';
import { RenderedElement } from '@/types/markdown';
import { debugMarkdownRendering, debugAreaMapping } from '@/lib/debug/markdown-debug';

/**
 * 京言主应用 - Markdown到移动端预览的转换工具
 */
export default function Home() {
  // 输入状态
  const [queryValue, setQueryValue] = useState('');
  const [markdownValue, setMarkdownValue] = useState('');
  
  // 渲染状态
  const [renderedElements, setRenderedElements] = useState<RenderedElement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebugBounds, setShowDebugBounds] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // 截图状态
  const [isSaving, setIsSaving] = useState(false);
  
  // 面板宽度状态（三档模式：25%, 50%, 75%）
  const widthPresets = [25, 50, 75];
  const [sidebarWidth, setSidebarWidth] = useState(33);
  const [isResizing, setIsResizing] = useState(false);
  
  const [previewMode, setPreviewMode] = useState<'single' | 'full'>('single');
  // 预览模式状态（单屏/全屏）
  const [showShortcutHint, setShowShortcutHint] = useState(true);

  // 客户端平台检测状态
  const [isMac, setIsMac] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  
  // 防抖处理，300ms延迟
  const debouncedMarkdown = useDebouncedValue(markdownValue, 300);

  // 拖拽调整宽度的处理函数（自由拖拽）
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.main-content-container') as HTMLElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      let newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      
      // 限制最小和最大宽度
      if (newWidth < 15) newWidth = 15;
      if (newWidth > 67) newWidth = 67;
      
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // TODO(human): 添加双击重置宽度功能

  // 客户端平台检测 - 避免Hydration错误
  useEffect(() => {
    setIsClientSide(true);
    setIsMac(navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // 初次进入显示一次轻提示，随后自动隐藏
  useEffect(() => {
    if (!showShortcutHint) return;
    const t = setTimeout(() => setShowShortcutHint(false), 3500);
    return () => clearTimeout(t);
  }, [showShortcutHint]);

  // 保存移动端预览图片功能 - 支持全屏模式的高质量截图
  const handleSaveImage = async () => {
    if (!markdownValue.trim() || isProcessing || isSaving) return;

    setIsSaving(true);
    console.log('📸 [截图] 开始高质量截图流程...');

    try {
      // 查找目标元素 - 手机框架容器
      const mobileFrame = document.querySelector('.mobile-device-frame') as HTMLElement;

      if (!mobileFrame) {
        console.error('❌ [截图] 找不到手机框架元素');
        throw new Error('找不到移动端预览容器\n\n请确保移动端预览已正常显示');
      }

      console.log('✅ [截图] 找到手机框架:', {
        className: mobileFrame.className,
        originalSize: `${mobileFrame.offsetWidth}x${mobileFrame.offsetHeight}`,
        currentTransform: window.getComputedStyle(mobileFrame).transform
      });

      // 是否为全屏缩放模式（不对真实DOM做任何可见修改，使用克隆样式覆盖）
      const isScaled = previewMode === 'full';

      // 📌 导出范围与视口信息
      // 目标：导出当前可视区域，而不是始终从内容顶部开始
      const isSingle = previewMode === 'single';
      const viewportWidth = mobileFrame.clientWidth;
      const viewportHeight = mobileFrame.clientHeight;

      // 定位可滚动容器与其内容
      const scroller = mobileFrame.querySelector('[data-role="mobile-scrollview"]') as HTMLElement | null;
      const scrollContent = scroller?.querySelector('[data-role="mobile-scrollcontent"]') as HTMLElement | null;

      // 记录原始状态，便于恢复
      const scrollAdjust = {
        applied: false,
        originalOverflow: '',
        originalTransform: '',
        originalScrollTop: 0,
      };

      if (isSingle && scroller && scrollContent) {
        // 在截图前，将滚动偏移“转化”为内容的负向位移
        // 这样克隆DOM时即便滚动位置不被保留，视觉上仍可获得当前视口内容
        scrollAdjust.applied = true;
        scrollAdjust.originalOverflow = scroller.style.overflow;
        scrollAdjust.originalTransform = scrollContent.style.transform;
        scrollAdjust.originalScrollTop = scroller.scrollTop;

        // 隐藏以避免用户看到瞬时跳动
        const originalVisibilityLocal = mobileFrame.style.visibility;
        mobileFrame.style.visibility = 'hidden';

        scroller.style.overflow = 'hidden';
        scroller.scrollTop = 0; // 避免库重置滚动产生影响
        scrollContent.style.transform = `translateY(-${scrollAdjust.originalScrollTop}px)`;

        // 强制重绘并恢复可视
        mobileFrame.offsetHeight;
        mobileFrame.style.visibility = originalVisibilityLocal;
      }

      // 📸 临时添加截图优化样式
      console.log('🎨 [截图] 应用截图优化样式...');
      const screenshotOptimizationStyle = document.createElement('style');
      screenshotOptimizationStyle.id = 'screenshot-optimization';
      screenshotOptimizationStyle.textContent = `
        .mobile-device-frame, .mobile-device-frame * {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE */
        }
        .mobile-device-frame::-webkit-scrollbar,
        .mobile-device-frame *::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari */
        }
        .mobile-device-frame {
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(screenshotOptimizationStyle);

      console.log('📏 [截图] 截图时尺寸:', {
        width: mobileFrame.offsetWidth,
        height: mobileFrame.offsetHeight,
        viewportWidth,
        viewportHeight,
        scrollHeight: mobileFrame.scrollHeight,
        innerScrollTop: scroller?.scrollTop || 0,
      });

      // 等待内容完全渲染
      console.log('⏳ [截图] 等待内容渲染完成...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // 生成文件名
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      const filename = `京言-移动端预览-${timestamp}.png`;

      let dataURL: string | null = null;

      // 🎯 方案1: html-to-image (主要方案) - 针对移动端优化
      try {
        console.log('🚀 [截图] 尝试 html-to-image (移动端优化)...');

        const captureWidth = isSingle ? viewportWidth : 390;
        const captureHeight = isSingle ? viewportHeight : mobileFrame.scrollHeight;
        const options:any = {
          quality: 1.0,
          backgroundColor: '#ffffff', // 纯白背景，避免灰色干扰
          pixelRatio: 2, // 2倍分辨率，确保清晰度
          width: captureWidth,
          height: captureHeight,
          cacheBust: true,
          useCORS: true,
          allowTaint: true,
          filter: (node: HTMLElement) => {
            // 过滤掉可能的滚动条和干扰元素
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const style = window.getComputedStyle(element);

              // 跳过绝对定位的滚动条或浮层元素
              if (style.position === 'absolute' && element.tagName !== 'DIV') return false;
              // 跳过可能的滚动条元素
              if (element.className.includes('scrollbar')) return false;
              // 跳过可能的overlay元素
              if (element.className.includes('overlay')) return false;
            }
            return true;
          },
          style: {
            // 确保无额外变形和干净的显示
            transform: 'none',
            transformOrigin: 'initial',
            overflow: 'hidden', // 隐藏可能的滚动条
            scrollbarWidth: 'none', // 隐藏滚动条(Firefox)
            msOverflowStyle: 'none', // 隐藏滚动条(IE)
          }
        };

        dataURL = await htmlToImage.toPng(mobileFrame, options);
        console.log('✅ [截图] html-to-image 成功!');

      } catch (htmlToImageError) {
        console.warn('⚠️ [截图] html-to-image 失败:', htmlToImageError);

        // 🎯 方案2: modern-screenshot (备选方案)
        try {
          console.log('🔄 [截图] 尝试 modern-screenshot...');

          const canvas = await domToCanvas(mobileFrame, {
            backgroundColor: '#f3f4f6',
            scale: 2, // 2倍缩放确保质量
            quality: 1.0,
            width: captureWidth,
            height: captureHeight
          });

          dataURL = canvas.toDataURL('image/png', 1.0);
          console.log('✅ [截图] modern-screenshot 成功!');

        } catch (modernScreenshotError) {
          console.warn('⚠️ [截图] modern-screenshot 失败:', modernScreenshotError);

          // 🎯 方案3: html-to-image 简化配置
          try {
            console.log('🔄 [截图] 尝试 html-to-image 简化配置...');

            dataURL = await htmlToImage.toPng(mobileFrame, {
              quality: 0.9,
              backgroundColor: '#f3f4f6',
              pixelRatio: 1,
              cacheBust: false
            });
            console.log('✅ [截图] html-to-image 简化配置成功!');

          } catch (fallbackError) {
            console.error('❌ [截图] 所有截图方案都失败了:', fallbackError);
            throw new Error('截图库无法处理当前页面内容');
          }
        }
      }

      // 无需恢复：未对真实DOM的缩放做改动

      // 恢复滚动相关的临时样式与位置
      if (scrollAdjust.applied && scroller && scrollContent) {
        scroller.style.overflow = scrollAdjust.originalOverflow;
        scrollContent.style.transform = scrollAdjust.originalTransform;
        scroller.scrollTop = scrollAdjust.originalScrollTop;
      }

      // 🧹 清理截图优化样式
      console.log('🧹 [截图] 清理截图优化样式...');
      const screenshotStyle = document.getElementById('screenshot-optimization');
      if (screenshotStyle) {
        screenshotStyle.remove();
      }

      if (!dataURL || dataURL.length < 1000) {
        throw new Error(`生成的图片数据异常: ${dataURL ? dataURL.length : 'null'} bytes`);
      }

      // 🎉 下载文件
      console.log('💾 [截图] 开始下载...');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const sizeKB = Math.round(dataURL.length / 1024);
      console.log(`🎉 [截图] 高质量保存成功: ${filename} (${sizeKB}KB)`);

    } catch (error) {
      console.error('💥 [截图] 流程失败:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // 确保恢复缩放状态（错误情况下）
      if (previewMode === 'full') {
        const mobileFrame = document.querySelector('.mobile-device-frame') as HTMLElement;
        if (mobileFrame) {
          // 恢复可见性
          const originalVisibility = mobileFrame.dataset.originalVisibility || '';
          mobileFrame.style.visibility = originalVisibility;

          // 恢复过渡动画
          const originalTransition = mobileFrame.dataset.originalTransition || '';
          mobileFrame.style.transition = originalTransition;

          // 清理内联样式，恢复到CSS控制的状态
          mobileFrame.style.transform = '';
          mobileFrame.style.transformOrigin = '';

          // 清理临时数据
          delete mobileFrame.dataset.originalTransition;
          delete mobileFrame.dataset.originalVisibility;
        }
      }

      // 🧹 清理截图优化样式（错误情况下）
      const errorScreenshotStyle = document.getElementById('screenshot-optimization');
      if (errorScreenshotStyle) {
        errorScreenshotStyle.remove();
      }

      // 用户友好的错误处理
      if (errorMessage.includes('找不到移动端预览容器')) {
        alert(`${errorMessage}\n\n💡 建议：\n1. 确保已输入Markdown内容\n2. 等待页面完全加载\n3. 检查移动端预览是否正常显示`);
      } else {
        alert(`截图保存失败: ${errorMessage}\n\n🛠️ 可以尝试：\n1. 切换到单屏模式再尝试截图\n2. 刷新页面后重试\n3. 使用浏览器截图功能：\n   • Chrome: F12 → 选择元素 → 右键 → "Capture node screenshot"\n   • Firefox: F12 → 截图工具`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 键盘快捷键处理 (切换预览模式)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // 检测平台：Mac使用metaKey (Cmd)，Windows使用ctrlKey (Ctrl)
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (!modifierKey) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPreviewMode('single');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPreviewMode('full');
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isMac]);

  // 处理Markdown内容变化
  useEffect(() => {
    const processMarkdown = async () => {
      if (!debouncedMarkdown.trim()) {
        setRenderedElements([]);
        return;
      }

      setIsProcessing(true);
      
      try {
        // 解析Markdown
        const parsedContent = parseMarkdownContent(debouncedMarkdown);
        
        // 渲染为React组件
        const rendered = renderMarkdownElements(parsedContent.elements);
        
        // 开发环境调试
        if (process.env.NODE_ENV === 'development') {
          debugMarkdownRendering(debouncedMarkdown, parsedContent.elements, rendered);
          debugAreaMapping();
        }
        
        setRenderedElements(rendered);
      } catch (error) {
        console.error('Markdown处理失败:', error);
        setRenderedElements([]);
      } finally {
        setIsProcessing(false);
      }
    };

    processMarkdown();
  }, [debouncedMarkdown]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Markdown移动端预览工具
            </h1>
            <p className="text-sm text-gray-600 mt-1">
            将输出的Markdown内容一键渲染为高保真移动端AI聊天框预览
            </p>
          </div>
          
          
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden main-content-container">
        {/* 左侧输入面板 */}
        <div 
          className={`flex flex-col transition-all duration-300 ease-in-out ${
            showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${showSidebar ? 'border-r border-gray-100 shadow-sm' : ''}`}
          style={{
            width: showSidebar ? `${sidebarWidth}%` : '0%',
            overflow: showSidebar ? 'visible' : 'hidden'
          }}
        >
          {showSidebar && (
            <InputPanel
              queryValue={queryValue}
              markdownValue={markdownValue}
              onQueryChange={setQueryValue}
              onMarkdownChange={setMarkdownValue}
              isProcessing={isProcessing}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
            />
          )}
        </div>

        {/* 拖拽分割线 - 仅在侧边栏显示时显示 */}
        {showSidebar && (
          <div
            className={`w-1 bg-gray-100 hover:bg-gray-200 cursor-col-resize flex-shrink-0 transition-colors duration-200 ${
              isResizing ? 'bg-blue-300' : ''
            } group`}
            onMouseDown={handleMouseDown}
            title="拖拽切换档位 (25% / 50% / 75%)"
          >
            {/* 拖拽指示器 */}
            <div className="h-full w-full relative flex items-center justify-center">
              <div className={`w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200 ${
                isResizing ? 'bg-blue-400' : ''
              }`}></div>
            </div>
          </div>
        )}

        {/* 右侧预览面板 */}
        <div 
          className="flex flex-col transition-all duration-300 ease-in-out relative"
          style={{
            width: showSidebar ? `${100 - sidebarWidth}%` : '100%'
          }}
        >
          {/* 顶部控制栏 */}
          <div className="flex items-center justify-between p-2 bg-gray-100" >
            {/* 左侧：展开侧边栏按钮 - 仅在隐藏时显示 */}
            <div className="flex items-center">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200"
                  title="显示侧边栏"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                  显示输入面板
                </button>
              )}
            </div>

            {/* 右侧：统一工具栏 */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-1 space-x-1">
              {/* 视图模式切换 */}
              <div className="flex items-center">
                <button
                  onClick={() => setPreviewMode('single')}
                  title="单屏模式"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    previewMode === 'single'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  单屏
                </button>
                <button
                  onClick={() => setPreviewMode('full')}
                  title="全屏模式"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    previewMode === 'full'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  全屏
                </button>
              </div>

              {/* 分隔线 */}
              <div className="w-px h-5 bg-gray-200"></div>

              {/* 保存图片按钮 */}
              <button
                onClick={handleSaveImage}
                disabled={!markdownValue.trim() || isProcessing || isSaving}
                className={`
                  group relative flex items-center justify-center gap-2 px-3 py-1.5
                  text-sm font-medium rounded-md transition-all duration-200
                  text-gray-600 hover:bg-gray-100 hover:text-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
                  active:scale-95
                `}
                title="保存移动端预览图片 (PNG格式，高质量)"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    <span>保存图片</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* 预览内容区域 */}
          <div className={`flex-1 ${previewMode === 'single' ? 'overflow-hidden' : 'overflow-y-auto'} relative`}>
            <MobilePreviewHTML
              markdownContent={markdownValue}
              queryValue={queryValue}
              isLoading={isProcessing}
              showDebugBounds={showDebugBounds}
              previewMode={previewMode}
              showSidebar={showSidebar}
              sidebarWidth={sidebarWidth}
            />
            {/* 角落轻提示：Notion风格，首次自动显示，常态极淡，悬停更清晰 */}
            <div
              className={`hidden md:flex items-center gap-1 absolute bottom-2 right-2 
              text-[12px] text-gray-600 select-none transition-opacity 
              ${showShortcutHint ? 'opacity-90' : 'opacity-90 hover:opacity-100'}`}
              aria-hidden="true"
              title="使用键盘快捷键切换视图"
            >
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">{isMac ? '⌘' : 'Ctrl'}</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">←</span>
              <span className="text-gray-400">/</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded">→</span>
              <span className="ml-1 text-gray-500">切换视图</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
