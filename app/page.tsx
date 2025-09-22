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
  
  const [previewMode, setPreviewMode] = useState<'single' | 'full' | 'canvas'>('single');
  // 预览模式状态（单屏/全屏/画布）
  const [showShortcutHint, setShowShortcutHint] = useState(true);

  // 画布模式状态
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasViewMode, setCanvasViewMode] = useState<'single' | 'full'>('single'); // 画布内的视图模式

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

    // 画布模式特殊处理：临时容器变量
    let tempContainer: HTMLElement | null = null;

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
      const isCanvasMode = previewMode === 'canvas';

      // 📌 导出范围与视口信息
      // 目标：导出当前可视区域，而不是始终从内容顶部开始
      const isSingle = previewMode === 'single' || (previewMode === 'canvas' && canvasViewMode === 'single');
      const viewportWidth = mobileFrame.clientWidth;
      const viewportHeight = mobileFrame.clientHeight;

      // 画布模式特殊处理：创建临时容器避免视觉闪动
      let screenshotTarget = mobileFrame;

      // 记录原始状态，便于恢复
      const scrollAdjust = {
        applied: false,
        originalOverflow: '',
        originalTransform: '',
        originalScrollTop: 0,
      };

      // 画布模式特殊处理：临时重置transform
      const canvasAdjust = {
        applied: false,
        originalTransform: '',
        originalPosition: '',
        originalTop: '',
        originalLeft: '',
        originalMarginTop: '',
        originalMarginLeft: '',
      };

      if (isCanvasMode) {
        console.log('🎨 [截图] 画布模式：创建临时截图容器...');
        canvasAdjust.applied = true;

        // 创建临时容器，位置在屏幕外
        tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '-10000px';
        tempContainer.style.left = '-10000px';
        tempContainer.style.pointerEvents = 'none';
        tempContainer.style.zIndex = '-9999';

        // 克隆手机框架
        const clonedFrame = mobileFrame.cloneNode(true) as HTMLElement;

        // 重置克隆元素的样式为截图友好的样式
        clonedFrame.style.transform = 'none';
        clonedFrame.style.position = 'static';
        clonedFrame.style.top = 'auto';
        clonedFrame.style.left = 'auto';
        clonedFrame.style.marginTop = '0';
        clonedFrame.style.marginLeft = '0';
        clonedFrame.style.visibility = 'visible';

        tempContainer.appendChild(clonedFrame);
        document.body.appendChild(tempContainer);

        // 使用克隆元素进行截图
        screenshotTarget = clonedFrame;
      } else {
        // 非画布模式也使用克隆，避免对真实DOM造成视觉干扰
        console.log('🎨 [截图] 非画布模式：创建临时截图容器...');
        tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '-10000px';
        tempContainer.style.left = '-10000px';
        tempContainer.style.pointerEvents = 'none';
        tempContainer.style.zIndex = '-9999';

        const clonedFrame = mobileFrame.cloneNode(true) as HTMLElement;
        clonedFrame.style.transform = 'none';
        clonedFrame.style.position = 'static';
        clonedFrame.style.top = 'auto';
        clonedFrame.style.left = 'auto';
        clonedFrame.style.marginTop = '0';
        clonedFrame.style.marginLeft = '0';
        clonedFrame.style.visibility = 'visible';

        tempContainer.appendChild(clonedFrame);
        document.body.appendChild(tempContainer);
        screenshotTarget = clonedFrame;
      }

      // 定位可滚动容器与其内容（使用截图目标）
      const scroller = screenshotTarget.querySelector('[data-role="mobile-scrollview"]') as HTMLElement | null;
      const scrollContent = scroller?.querySelector('[data-role="mobile-scrollcontent"]') as HTMLElement | null;

      // 等待图片资源加载完成，避免截图时外链图片未就绪
      const waitForImages = async (root: HTMLElement, timeoutMs = 4000) => {
        const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
        const pending = imgs.filter(img => !img.complete || img.naturalWidth === 0);
        if (pending.length === 0) return;
        await Promise.race([
          Promise.all(
            pending.map(
              img => new Promise<void>(resolve => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
              })
            )
          ),
          new Promise<void>(resolve => setTimeout(resolve, timeoutMs))
        ]);
      };
      await waitForImages(screenshotTarget);

      // 将代理图片预内联为 dataURL，减少导出时并发抓取与跨域波动
      const preInlineImages = async (root: HTMLElement, timeoutMs = 6000) => {
        const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
        const rootOrigin = window.location.origin;
        const isProxyUrl = (u: string) => u.startsWith(rootOrigin + '/api/image-proxy') || u.startsWith('/api/image-proxy');
        const toDataURL = async (url: string) => {
          const resp = await fetch(url, { cache: 'force-cache' });
          const blob = await resp.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        };
        const targets = imgs.filter(img => isProxyUrl(img.src));
        await Promise.race([
          Promise.all(targets.map(async img => {
            try {
              const dataUrl = await toDataURL(img.src);
              img.setAttribute('src', dataUrl);
              img.removeAttribute('crossorigin');
              img.removeAttribute('referrerpolicy');
            } catch (e) {
              // ignore single image failure
            }
          })),
          new Promise<void>(resolve => setTimeout(resolve, timeoutMs))
        ]);
      };
      await preInlineImages(screenshotTarget);

      if (isSingle && scroller && scrollContent) {
        // 在克隆节点上，将原始滚动位置转化为负向位移，复现当前视口
        const originalScroller = mobileFrame.querySelector('[data-role="mobile-scrollview"]') as HTMLElement | null;
        const originalScrollTop = originalScroller?.scrollTop || 0;
        scroller.style.overflow = 'hidden';
        scroller.scrollTop = 0;
        scrollContent.style.transform = `translateY(-${originalScrollTop}px)`;
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
        width: screenshotTarget.offsetWidth,
        height: screenshotTarget.offsetHeight,
        viewportWidth,
        viewportHeight,
        scrollHeight: screenshotTarget.scrollHeight,
        innerScrollTop: scroller?.scrollTop || 0,
      });

      // 等待内容完全渲染
      console.log('⏳ [截图] 等待内容渲染完成...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // 生成文件名
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      const filename = `京言-移动端预览-${timestamp}.png`;

      let dataURL: string | null = null;

      // 计算捕获尺寸（单屏：固定844px；全屏：实际内容高度）
      const captureWidth = 390; // 固定宽度
      const captureHeight = isSingle ? 844 : screenshotTarget.scrollHeight;

      // 🎯 方案1: html-to-image (主要方案) - 针对移动端优化
      try {
        console.log('🚀 [截图] 尝试 html-to-image (移动端优化)...');

        const options: Parameters<typeof htmlToImage.toPng>[1] = {
          quality: 1.0,
          backgroundColor: '#ffffff', // 纯白背景，避免灰色干扰
          pixelRatio: 2, // 2倍分辨率，确保清晰度
          width: captureWidth,
          height: captureHeight,
          cacheBust: true,
          filter: (node: HTMLElement) => {
            // 过滤掉可能的滚动条和干扰元素
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const style = window.getComputedStyle(element);
              // 仅跳过明显的滚动条/遮罩/动画光标等，不要过滤普通图片
              // 跳过可能的滚动条元素
              if (element.className.includes('scrollbar')) return false;
              // 跳过可能的overlay元素
              if (element.className.includes('overlay')) return false;
              // 可通过 data-omit-screenshot 自定义忽略
              if (element.getAttribute('data-omit-screenshot') === 'true') return false;
            }
            return true;
          },
          style: {
            // 确保无额外变形和干净的显示
            transform: 'none',
            transformOrigin: 'initial',
            overflow: 'hidden', // 隐藏可能的滚动条
            scrollbarWidth: 'none', // 隐藏滚动条(Firefox)
          }
        };

        dataURL = await htmlToImage.toPng(screenshotTarget, options);
        console.log('✅ [截图] html-to-image 成功!');

      } catch (htmlToImageError) {
        console.warn('⚠️ [截图] html-to-image 失败:', htmlToImageError);

        // 🎯 方案2: modern-screenshot (备选方案)
        try {
          console.log('🔄 [截图] 尝试 modern-screenshot...');

          const canvas = await domToCanvas(screenshotTarget, {
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

            dataURL = await htmlToImage.toPng(screenshotTarget, {
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

      // 清理画布模式的临时容器
      if (tempContainer) {
        console.log('🎨 [截图] 画布模式：清理临时容器...');
        document.body.removeChild(tempContainer);
        tempContainer = null;
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

      // 清理画布模式的临时容器（错误情况下）
      if (tempContainer) {
        console.log('🎨 [截图-错误] 清理临时容器...');
        try {
          document.body.removeChild(tempContainer);
        } catch (e) {
          console.warn('清理临时容器失败:', e);
        }
        tempContainer = null;
      }

      // 用户友好的错误处理
      if (errorMessage.includes('找不到移动端预览容器')) {
        alert(`${errorMessage}\n\n💡 建议：\n1. 确保已输入Markdown内容\n2. 等待页面完全加载\n3. 检查移动端预览是否正常显示`);
      } else {
        alert(`截图保存失败: ${errorMessage}\n\n🛠️ 可以尝试：\n1. 切换到单屏模式再尝试截图\n2. 刷新页面后重试\n3. 使用浏览器截图功能：\n   • Chrome: F12 → 选择元素 → 右键 → "Capture node screenshot"\n   • Firefox: F12 → 截图工具`);
      }
    } finally {
      // 清理画布模式的临时容器（最终清理）
      if (tempContainer) {
        console.log('🎨 [截图-最终] 清理临时容器...');
        try {
          document.body.removeChild(tempContainer);
        } catch (e) {
          console.warn('最终清理临时容器失败:', e);
        }
      }

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
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPreviewMode('canvas');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // 从画布模式退出到单屏模式
        if (previewMode === 'canvas') {
          setPreviewMode('single');
        }
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
            京言  Markdown 转 AI 聊天界面预览
            </h1>
            <p className="text-sm text-gray-600 mt-1">
            一键将 Markdown 渲染为高保真移动端AI Chatbot聊天页面，所见即所得、可直接导出
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
                <button
                  onClick={() => setPreviewMode('canvas')}
                  title="画布模式 - 自由缩放和拖拽"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    previewMode === 'canvas'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M9 12h6M12 9l3 3-3 3" />
                  </svg>
                  画布
                </button>
              </div>

              {/* 画布模式专用控件 */}
              {previewMode === 'canvas' && (
                <>
                  <div className="w-px h-5 bg-gray-200"></div>

                  {/* 画布内视图模式切换 */}
                  <div className="flex items-center bg-gray-50 rounded-md p-0.5">
                    <button
                      onClick={() => setCanvasViewMode('single')}
                      title="画布单屏模式"
                      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                        canvasViewMode === 'single'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      单屏
                    </button>
                    <button
                      onClick={() => setCanvasViewMode('full')}
                      title="画布全屏模式"
                      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                        canvasViewMode === 'full'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      全屏
                    </button>
                  </div>

                  <div className="w-px h-5 bg-gray-200"></div>

                  {/* 缩放控制 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => (window as any).__canvasZoomOut?.()}
                      title="缩小 (Ctrl + -)"
                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>

                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-700 min-w-[50px] justify-center">
                      <span>{Math.round(canvasScale * 100)}%</span>
                    </div>

                    <button
                      onClick={() => (window as any).__canvasZoomIn?.()}
                      title="放大 (Ctrl + +)"
                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-px h-5 bg-gray-200"></div>

                  {/* 视图适应控制 */}
                  <button
                    onClick={() => (window as any).__canvasFitToView?.()}
                    title="适应窗口大小"
                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all duration-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    适应窗口
                  </button>
                </>
              )}

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
          <div className={`flex-1 ${previewMode === 'single' ? 'overflow-hidden' : previewMode === 'canvas' ? 'overflow-hidden' : 'overflow-y-auto'} relative`}>
            <MobilePreviewHTML
              markdownContent={markdownValue}
              queryValue={queryValue}
              isLoading={isProcessing}
              showDebugBounds={showDebugBounds}
              previewMode={previewMode}
              canvasViewMode={canvasViewMode}
              showSidebar={showSidebar}
              sidebarWidth={sidebarWidth}
              onScaleChange={setCanvasScale}
              onResetView={() => {}}
              onFitToView={() => {}}
            />
            {/* 角落轻提示：Notion风格，固定在右下角 */}
            <div
              className={`hidden md:flex items-center gap-1 fixed bottom-4 right-4 z-50
              text-[12px] text-gray-600 select-none transition-opacity
              ${showShortcutHint ? 'opacity-90' : 'opacity-70 hover:opacity-100'}`}
              aria-hidden="true"
              title="使用键盘快捷键切换视图"
            >
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded shadow-sm">{isMac ? '⌘' : 'Ctrl'}</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded shadow-sm">←</span>
              <span className="text-gray-400">/</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded shadow-sm">→</span>
              <span className="text-gray-400">/</span>
              <span className="px-1.5 py-0.5 border border-gray-300 bg-white rounded shadow-sm">↑</span>
              <span className="ml-1 text-gray-500">切换视图</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
