'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MobileInputBar from './MobileInputBar';
import ProductCard from '@/components/product/ProductCard';
import { getProductMockData } from '@/lib/product/productUtils';
import { getRandomProductImage } from '@/lib/product/productImages';
import { useCanvasTransform } from '@/hooks/use-canvas-transform';
import { getProxiedImageUrl } from '@/lib/image/proxy';

/**
 * 预处理Markdown内容：处理特殊标记
 * 1. [product:id] → 商品卡片占位符
 * 2. <ClickText>文本</ClickText> → 下划线文本
 *
 * 注意：使用 ⟪⟫ 作为分隔符，避免被Markdown解析器处理（__ 会被当作斜体）
 */
function preprocessMarkdown(markdown: string): string {
  let processed = markdown;

  // 处理 [product:id] 格式 - 使用特殊的Unicode字符作为分隔符
  // 自动在商品卡片前后添加空行，使其独立成段
  processed = processed.replace(/\[product:(\d+)\]/g, (match, id) => {
    return `\n\n⟪PRODUCT_CARD_${id}⟫\n\n`;
  });

  // 处理 <ClickText>文本</ClickText> 格式
  processed = processed.replace(/<ClickText>(.*?)<\/ClickText>/g, (match, text) => {
    return `⟪CLICK_TEXT_START⟫${text}⟪CLICK_TEXT_END⟫`;
  });

  return processed;
}

/**
 * 渲染处理后的文本节点：还原特殊标记为实际组件
 */
function renderProcessedText(text: string, showDebugBounds = false, productImageMode: 'mock' | 'shimmer' = 'mock'): React.ReactNode {
  // 检测是否包含特殊标记（使用新的分隔符）
  const hasProductCard = text.includes('⟪PRODUCT_CARD_');
  const hasClickText = text.includes('⟪CLICK_TEXT_');

  if (!hasProductCard && !hasClickText) {
    return text;
  }

  // 分割文本，提取所有标记
  const parts: Array<{ type: 'text' | 'product' | 'clicktext'; content: string }> = [];
  let lastIndex = 0;

  // 合并正则：匹配商品卡片和下划线文本
  const regex = /⟪PRODUCT_CARD_(\d+)⟫|⟪CLICK_TEXT_START⟫(.*?)⟪CLICK_TEXT_END⟫/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // 判断匹配类型
    if (match[0].startsWith('⟪PRODUCT_CARD_')) {
      parts.push({
        type: 'product',
        content: match[1] // 商品ID
      });
    } else if (match[0].startsWith('⟪CLICK_TEXT_START⟫')) {
      parts.push({
        type: 'clicktext',
        content: match[2] // 文本内容
      });
    }

    lastIndex = regex.lastIndex;
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'product') {
          // 渲染商品卡片
          const productData = getProductMockData(part.content, `商品 ${part.content}`);
          // 根据 productImageMode 决定是否传递图片 URL
          const productDataWithImg = {
            ...productData,
            // shimmer 模式下传递空字符串，让组件只显示 shimmer 特效
            imageUrl: productImageMode === 'shimmer' ? '' : getRandomProductImage(part.content)
          };
          return (
            <div key={`product-${part.content}-${index}`} className="my-2">
              <ProductCard
                product={productDataWithImg}
                showDebugBounds={showDebugBounds}
              />
            </div>
          );
        } else if (part.type === 'clicktext') {
          // 渲染下划线文本
          return (
            <span
              key={`clicktext-${index}`}
              className="underline decoration-1 underline-offset-2 decoration-gray-400"
            >
              {part.content}
            </span>
          );
        } else {
          // 普通文本 - 如果前后都没有商品卡片，包裹在 <p> 中；否则只返回 span
          const trimmedContent = part.content.trim();
          if (!trimmedContent) return null;

          // 检查是否是独立的文本段落（前后都没有商品）
          const hasPrevProduct = index > 0 && parts[index - 1].type === 'product';
          const hasNextProduct = index < parts.length - 1 && parts[index + 1].type === 'product';

          if (!hasPrevProduct && !hasNextProduct && parts.length === 1) {
            // 单独的文本，使用 <p>
            return (
              <p key={`text-${index}`} className="text-sm text-gray-700 leading-relaxed mb-2">
                {trimmedContent}
              </p>
            );
          }

          // 混合内容，只用 span
          return <span key={`text-${index}`}>{part.content}</span>;
        }
      })}
    </>
  );
}

// 通用SKU检测和渲染函数
const renderWithSkuCards = (children: React.ReactNode, showDebugBounds = false, productImageMode: 'mock' | 'shimmer' = 'mock'): React.ReactNode => {
  // 将children转换为字符串来检查
  const childrenString = React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string') return child;
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
        return typeof child.props.children === 'string' ? (child.props.children as string) : '';
      }
      return '';
    })
    .join('');

  // 优先检查是否包含新格式的token（使用新的分隔符）
  if (childrenString.includes('⟪PRODUCT_CARD_') || childrenString.includes('⟪CLICK_TEXT_')) {
    return renderProcessedText(childrenString, showDebugBounds, productImageMode);
  }

  // 检查是否包含sku_id格式的链接，支持可选的价格与图片URL参数：[title](<sku_id>xxx</sku_id>)[price][img_url]
  const skuLinkRegex = /\[([^\]]+)\]\(<sku_id>([A-Za-z0-9_]+)<\/sku_id>\)(?:\[([^\]]+)\])?(?:\[(https?:\/\/[^\]]+)\])?/g;
  const matches = childrenString.match(skuLinkRegex);

  if (matches && matches.length > 0) {
    // 解析每个匹配项
    type SkuPart = { type: 'sku_card'; skuId: string; title: string; customPrice?: string; imageUrl?: string };
    type TextPart = { type: 'text'; content: string };
    type Part = SkuPart | TextPart;
    const parts: Part[] = [];
    let lastIndex = 0;
    let match;

    const regex = /\[([^\]]+)\]\(<sku_id>([A-Za-z0-9_]+)<\/sku_id>\)(?:\[([^\]]+)\])?(?:\[(https?:\/\/[^\]]+)\])?/g;
    while ((match = regex.exec(childrenString)) !== null) {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: childrenString.slice(lastIndex, match.index)
        });
      }
      
      // 添加商品卡片
      parts.push({
        type: 'sku_card',
        skuId: match[2],
        title: match[1],
        customPrice: match[3], // 可选价格
        imageUrl: match[4] // 可选图片URL
      });
      
      lastIndex = regex.lastIndex;
    }
    
    // 添加剩余文本
    if (lastIndex < childrenString.length) {
      parts.push({
        type: 'text',
        content: childrenString.slice(lastIndex)
      });
    }
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'sku_card') {
            const productData = getProductMockData(part.skuId, part.title, part.customPrice);
            const productDataWithImg = {
              ...productData,
              imageUrl: part.imageUrl || getRandomProductImage(part.skuId)
            };
            return (
              <div key={`sku-${part.skuId}-${index}`} className="my-2">
                <ProductCard
                  product={productDataWithImg}
                  showDebugBounds={showDebugBounds}
                />
              </div>
            );
          } else {
            return part.content.trim() ? (
              <span key={`text-${index}`}>
                {part.content.trim()}
              </span>
            ) : null;
          }
        })}
      </>
    );
  }
  
  // 如果没有SKU链接，返回原始内容
  return children;
};

interface MobilePreviewHTMLProps {
  markdownContent: string; // 直接接收原始Markdown文本
  queryValue?: string; // 用户查询内容
  isLoading?: boolean;
  showDebugBounds?: boolean;
  previewMode?: 'single' | 'full' | 'canvas'; // 预览模式：单屏、全屏或画布模式
  canvasViewMode?: 'single' | 'full'; // 画布模式下的内部视图模式
  showSidebar?: boolean; // 侧边栏显示状态，用于计算可用空间
  sidebarWidth?: number; // 侧边栏宽度百分比，用于精确计算缩放
  productImageMode?: 'mock' | 'shimmer'; // 商品卡片图片显示模式
  // 画布控制回调
  onScaleChange?: (scale: number) => void;
  onResetView?: () => void;
  onFitToView?: () => void;
}

/**
 * 基于京言AI助手HTML结构的移动端预览组件
 * 复刻完整的聊天界面和产品展示布局
 */
export default function MobilePreviewHTML({
  markdownContent,
  queryValue = '',
  isLoading = false,
  showDebugBounds = false,
  previewMode = 'single',
  canvasViewMode = 'single',
  showSidebar = true,
  sidebarWidth = 50,
  productImageMode = 'mock',
  onScaleChange,
  onResetView,
  onFitToView
}: MobilePreviewHTMLProps) {

  const isSingleMode = previewMode === 'single';
  const isCanvasMode = previewMode === 'canvas';
  // 在画布模式下，实际的显示模式由canvasViewMode决定
  const effectiveViewMode = isCanvasMode ? canvasViewMode : previewMode;
  const isEffectiveSingle = effectiveViewMode === 'single';
  const topNavIconSrc = getProxiedImageUrl('https://img13.360buyimg.com/imagetools/jfs/t1/330920/24/6011/8950/68b180ebFa0b81de2/2ae3e75b7cc7245b.png');

  // 画布变换Hook
  const canvasTransform = useCanvasTransform(
    isCanvasMode ? 1 : 1, // 初始缩放
    0, // 初始X偏移
    0, // 初始Y偏移
    isCanvasMode // 是否为画布模式
  );

  // 通知父组件缩放变化
  React.useEffect(() => {
    if (isCanvasMode && onScaleChange) {
      onScaleChange(canvasTransform.transform.scale);
    }
  }, [canvasTransform.transform.scale, isCanvasMode, onScaleChange]);

  // 画布模式下视图模式切换时锚定到手机预览组件顶部
  React.useEffect(() => {
    if (isCanvasMode && canvasTransform.canvasRef.current) {
      // 延迟执行，确保DOM已更新
      const timeoutId = setTimeout(() => {
        const canvasElement = canvasTransform.canvasRef.current;
        if (!canvasElement) return;

        // 找到手机框架元素
        const mobileFrame = canvasElement.querySelector('.mobile-device-frame') as HTMLElement;
        if (mobileFrame) {
          // 获取手机框架相对于画布容器的位置
          const canvasRect = canvasElement.getBoundingClientRect();
          const frameRect = mobileFrame.getBoundingClientRect();

          // 计算需要的偏移量，使手机框架顶部对齐到画布容器的顶部（加上一些边距）
          const targetOffsetY = 50; // 距离顶部50px的边距
          const currentOffsetY = frameRect.top - canvasRect.top;
          const adjustmentY = targetOffsetY - currentOffsetY;

          // 只有在需要较大调整时才执行（避免微小的抖动）
          if (Math.abs(adjustmentY) > 10) {
            // 平滑调整视图位置
            const currentTransform = canvasTransform.transform;
            const newTranslateY = currentTransform.translateY + adjustmentY;

            // 使用画布变换的内部方法调整位置
            canvasTransform.updateTransform({
              ...currentTransform,
              translateY: newTranslateY
            });
          }
        }
      }, 100); // 100ms延迟确保DOM更新完成

      return () => clearTimeout(timeoutId);
    }
  }, [canvasViewMode, isCanvasMode]); // 只依赖基本值，避免对象引用导致的不稳定

  // 暴露画布控制功能给全局window对象
  React.useEffect(() => {
    if (isCanvasMode) {
      (window as any).__canvasZoomIn = canvasTransform.zoomIn;
      (window as any).__canvasZoomOut = canvasTransform.zoomOut;
      (window as any).__canvasFitToView = () => {
        const containerWidth = showSidebar ?
          window.innerWidth * (100 - sidebarWidth) / 100 - 60 : window.innerWidth - 60;
        const containerHeight = window.innerHeight - 200;
        canvasTransform.fitToView(containerWidth, containerHeight, 390, 844);
      };
    } else {
      // 清理全局函数
      delete (window as any).__canvasZoomIn;
      delete (window as any).__canvasZoomOut;
      delete (window as any).__canvasFitToView;
    }
  }, [isCanvasMode, canvasTransform.zoomIn, canvasTransform.zoomOut, canvasTransform.fitToView, showSidebar, sidebarWidth]);
  
  // 计算全屏模式的缩放比例 - 确保完整内容可见
  const getScaleRatio = () => {
    if (typeof window === 'undefined') return 0.5; // SSR默认值
    
    // 计算可用的显示区域
    const availableWidth = showSidebar ? 
      window.innerWidth * (100 - sidebarWidth) / 100 - 60 : window.innerWidth - 60;
    const availableHeight = window.innerHeight - 200; // 减去头部和控制栏高度
    
    // 移动端原始尺寸
    const targetWidth = 390;
    const targetHeight = 1800; // 预估长内容的高度
    
    // 基于宽度和高度计算缩放比例，取较小值确保完整显示
    const widthRatio = availableWidth / targetWidth;
    const heightRatio = availableHeight / targetHeight;
    
    // 选择更小的比例，确保内容完整可见，范围控制在0.3-0.8之间
    const ratio = Math.min(0.8, Math.max(0.3, Math.min(widthRatio, heightRatio)));
    return Number(ratio.toFixed(2));
  };
  
  const scaleRatio = !isSingleMode && !isCanvasMode ? getScaleRatio() : 1;

  return (
    <div
      className={`mobile-preview-container transition-all duration-300 ${
        isCanvasMode
          ? 'h-full w-full overflow-hidden relative bg-gray-100'
          : `flex justify-center bg-gray-100 ${
              isSingleMode ? 'h-full items-start' : 'min-h-full items-start overflow-y-auto p-2'
            }`
      }`}
      {...(isCanvasMode ? {
        ref: canvasTransform.canvasRef,
        onMouseDown: canvasTransform.handleMouseDown,
        style: {
          cursor: canvasTransform.isDragging ? 'grabbing' : 'default',
          backgroundColor: '#f3f4f6' // 与其他模式保持一致的背景色
        }
      } : {})}
    >
      {/* 画布模式的网格背景 */}
      {isCanvasMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, #d1d5db 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '10px 10px',
            opacity: 0.3
          }}
        />
      )}

      {/* 手机框架容器 */}
      <div
        className={`relative flex flex-col bg-white overflow-hidden mobile-device-frame transition-all duration-300 ${
          isSingleMode
            ? 'rounded-2xl shadow-2xl'
            : isCanvasMode
            ? 'rounded-2xl shadow-2xl'
            : 'rounded-lg shadow-lg'
        }`}
        style={{
          fontFamily: 'Microsoft YaHei, 微软雅黑, -apple-system, Helvetica, sans-serif',
          ...(isCanvasMode ? {
            // 画布模式：根据canvasViewMode决定尺寸
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '390px',
            minWidth: '390px',
            ...(isEffectiveSingle ? {
              height: '844px',
              minHeight: '844px',
              marginTop: '-422px', // 高度的一半
            } : {
              height: 'auto',
              minHeight: 'auto',
              maxHeight: 'none',
              marginTop: '-50px', // 动态高度时的简单偏移
            }),
            ...canvasTransform.getTransformStyle(),
            marginLeft: '-195px', // 宽度的一半
          } : isSingleMode
            ? {
                width: '390px',
                height: '844px',
                minWidth: '390px',
                minHeight: '844px'
              }
            : {
                width: '390px',
                minWidth: '390px',
                height: 'auto',
                minHeight: 'auto',
                maxHeight: 'none', // 允许内容完全展开
                transform: `scale(${scaleRatio})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - scaleRatio) * 200}px` // 补偿缩放造成的空间变化
              })
        }}
      >
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={topNavIconSrc || undefined} alt="" className="w-6 h-6 mr-2" />
            <div className="text-sm font-medium text-gray-900">有问题，找京言</div>
          </div>
          <div className="close-nav-icon touch">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4BAMAAABaqCYtAAAAMFBMVEUAAAAAAAAFBQUAAAAAAAAAAAAFBQUCAgIAAAADAwMEBAQAAAAaGhoKCgoQEBAHBwczkGvnAAAADHRSTlMAX++QUKDf3xDfz68+LBM2AAAA30lEQVQ4y3zTIQ4CQQyF4eKQBM8NUByAM3AIbsOtkKSQkCBxWBwWQSrIL97LW7HbdvbbZGfaWu6OZa/1p+r0vq7c2uJ5O9S+++4WN92v+nYPVdh9rm0PdbAvcx9qYD/mofRPHEVABRIpJLSQWCGJg2QWkuqr5BZSUEjFQkoKqTkIBRoKNBRoKNBQoKFApUClwLyYP6sQGn4lbULevrjx+cjiYec2yQ2WWzM3dR6HPEh5BPPw5rEnVEqkVCEA6OhvvgiNmFpzcBepxxl08BTG+ItxVnwVAINRCfYM4KnMAAAzyXShcWg9AgAAAABJRU5ErkJggg==" alt="" />
          </div>
        </div>
      </div>

      {/* 消息滚动视图 */}
      <div
        className={`bg-gray-100 ${
          isEffectiveSingle
            ? 'flex-1 overflow-y-auto'
            : 'overflow-visible'
        }`}
        style={{
          backgroundColor: 'rgb(255, 255, 255)',
          paddingBottom: isEffectiveSingle ? '83px' : '0' // 为输入框预留空间
        }}
        data-role="mobile-scrollview"
      >
        <div className="p-4" data-role="mobile-scrollcontent">


          {/* 用户消息气泡 */}
          {queryValue && (
            <div className="user-message-container-floor user-message-container message-container mb-4">
              <div className="content" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.16rem' }}>
                <div className="topic-container"></div>
                <div 
                  className="text-container"
                  style={{
                    background: 'linear-gradient(90deg,rgba(249,18,180,.12),rgba(255,15,35,.12))',
                    borderRadius: '12px 12px 4px 12px',
                    boxSizing: 'border-box',
                    marginLeft: 'auto',
                    maxWidth: '70%',
                    padding: '8px 12px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    fontFamily: 'Microsoft YaHei, 微软雅黑, -apple-system, Helvetica, sans-serif',
                    lineHeight: '1.4',
                    textAlign: 'left'
                  }}
                >
                  {queryValue}
                </div>
              </div>
            </div>
          )}

          {/* AI回复消息卡片 */}
          <div className="message-card mb-4">
            <div className="bg-white">
              <div className="p-2">
                {/* 分析推导过程（折叠） */}
                <div className="mb-4">
                  <div className="flex items-center text-xs text-gray-500 cursor-pointer">
                    <span>查看分析推导过程</span>
                    <img 
                      className="ml-1 w-3 h-3" 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkBAMAAAATLoWrAAAAJ1BMVEUAAACHi5OJjZWJjJaIi5SIi5OHj5eJjJSJipWHi5OKjJWGjJOIi5QRV08UAAAADHRSTlMAoH9fv5Agz6+Ab1BVgQ4YAAAAWklEQVQoz2MYjiBjA4zF5QZl1ByGCekcgTJkzhhAGExnjkKFGM9AlemcEWBAKIMoOggk4coQihDK4IoQyuCKEMrgihDK4IoQyuCKEMrgihDKDmL4nXUCw3AFAJvMHijdGqNSAAAAAElFTkSuQmCC" 
                      alt=""
                    />
                  </div>
                </div>

                {/* Markdown内容渲染区域 - 使用ReactMarkdown进行1:1渲染 */}
                <div className="markdown-global-style-floor">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-gray-500 text-sm">AI正在分析中...</span>
                    </div>
                  ) : (
                    <div className={`space-y-4 ${showDebugBounds ? 'border border-red-300 bg-red-50 p-2' : ''}`}>
                      {markdownContent ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold text-gray-900 mb-2">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold text-gray-800 mb-1.5">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-semibold text-gray-800 mb-1.5">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </h3>
                            ),
                            p: ({ children }: { children?: React.ReactNode }) => {
                              // 将children转换为字符串来检查
                              const childrenString = React.Children.toArray(children)
                                .map(child => {
                                  if (typeof child === 'string') return child;
                                  if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
                                    return typeof child.props.children === 'string' ? (child.props.children as string) : '';
                                  }
                                  return '';
                                })
                                .join('');

                              // 检查是否包含sku_id格式的链接，支持可选的价格与图片URL参数：[title](<sku_id>xxx</sku_id>)[price][img_url]
                              const skuLinkRegex = /\[([^\]]+)\]\(<sku_id>([A-Za-z0-9_]+)<\/sku_id>\)(?:\[([^\]]+)\])?(?:\[(https?:\/\/[^\]]+)\])?/g;

                              const matches = childrenString.match(skuLinkRegex);

                              if (matches && matches.length > 0) {
                                // 解析每个匹配项
                                type SkuPart = { type: 'sku_card'; skuId: string; title: string; customPrice?: string; imageUrl?: string };
                                type TextPart = { type: 'text'; content: string };
                                type Part = SkuPart | TextPart;
                                const parts: Part[] = [];
                                let lastIndex = 0;
                                let match;

                                const regex = /\[([^\]]+)\]\(<sku_id>([A-Za-z0-9_]+)<\/sku_id>\)(?:\[([^\]]+)\])?(?:\[(https?:\/\/[^\]]+)\])?/g;
                                while ((match = regex.exec(childrenString)) !== null) {
                                  // 添加匹配前的文本
                                  if (match.index > lastIndex) {
                                    parts.push({
                                      type: 'text',
                                      content: childrenString.slice(lastIndex, match.index)
                                    });
                                  }
                                  
                                  // 添加商品卡片
                                  parts.push({
                                    type: 'sku_card',
                                    skuId: match[2],
                                    title: match[1],
                                    customPrice: match[3], // 价格（可选）
                                    imageUrl: match[4] // 图片URL（可选）
                                  });
                                  
                                  lastIndex = regex.lastIndex;
                                }
                                
                                // 添加剩余文本
                                if (lastIndex < childrenString.length) {
                                  parts.push({
                                    type: 'text',
                                    content: childrenString.slice(lastIndex)
                                  });
                                }
                                
                                return (
                                  <>
                                    {parts.map((part, index) => {
                                      if (part.type === 'sku_card') {
                                        const productData = getProductMockData(part.skuId, part.title, part.customPrice);
                                        const productDataWithImg = {
                                          ...productData,
                                          imageUrl: part.imageUrl || getRandomProductImage(part.skuId)
                                        };
                                        return (
                                          <div key={`sku-${part.skuId}-${index}`} className="my-2">
                                            <ProductCard
                                              product={productDataWithImg}
                                              showDebugBounds={showDebugBounds}
                                            />
                                          </div>
                                        );
                                      } else {
                                        return part.content.trim() ? (
                                          <p key={`text-${index}`} className="text-sm text-gray-700 leading-relaxed mb-2">
                                            {part.content.trim()}
                                          </p>
                                        ) : null;
                                      }
                                    })}
                                  </>
                                );
                              }

                              // 检查是否包含新格式的token（使用新的分隔符）
                              if (childrenString.includes('⟪PRODUCT_CARD_') || childrenString.includes('⟪CLICK_TEXT_')) {
                                // 如果包含商品卡片，不能用 <p> 包裹（HTML不允许 <p> 内有 <div>）
                                if (childrenString.includes('⟪PRODUCT_CARD_')) {
                                  return renderProcessedText(childrenString, showDebugBounds, productImageMode);
                                }
                                // 只有 ClickText 时可以用 <p> 包裹
                                return (
                                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                    {renderProcessedText(childrenString, showDebugBounds, productImageMode)}
                                  </p>
                                );
                              }

                              // 普通段落正常处理
                              return <p className="text-sm text-gray-700 leading-relaxed mb-2">{children}</p>;
                            },
                            ul: ({ children }) => (
                              <ul className="mb-2" style={{ listStyleType: 'disc', listStylePosition: 'outside', margin: 0, padding: 0, paddingLeft: '20px' }}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-2" style={{ listStyleType: 'decimal', listStylePosition: 'outside', margin: 0, padding: 0, paddingLeft: '20px' }}>
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm text-gray-700 leading-relaxed" style={{ display: 'list-item', marginBottom: 0, paddingBottom: 0, paddingLeft: '4px' }}>
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </li>
                            ),
                            blockquote: ({ children }) => (
                              <div className="text-sm text-gray-600 italic mb-2">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </div>
                            ),
                            code: ({ children }) => {
                              // 检查是否是内联代码（没有换行符）
                              const isInline = typeof children === 'string' && !children.includes('\n');
                              return isInline ? (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                              ) : (
                                <pre className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto mb-3">
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                            table: ({ children }) => (
                              <div className="overflow-x-auto mb-4">
                                <table className="min-w-full text-xs border border-gray-200 bg-white">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => <tr>{children}</tr>,
                            th: ({ children }) => (
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 border-b border-gray-300 border-r border-gray-200">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-gray-700 border-b border-gray-200 border-r border-gray-200">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </td>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">
                                {renderWithSkuCards(children, showDebugBounds, productImageMode)}
                              </em>
                            ),
                            a: ({ href, children }) => {
                              // 普通链接正常处理
                              return <a href={href} className="text-blue-600 underline">{children}</a>;
                            },
                          }}
                        >
{preprocessMarkdown(markdownContent)}
                        </ReactMarkdown>
                      ) : (
                        <div className="text-gray-500 text-sm text-center py-4">
                          等待输入Markdown内容...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 底部操作栏 */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-xs text-gray-500">
                      <img 
                        className="w-4 h-4 mr-1" 
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAANlBMVEUAAACIi5SHjJSEi5OJi5SHiZOIi5SIipSIi5SHi5SJi5SHiZOHipOIipSIi5OIi5OIjJOIi5Q5RYHaAAAAEXRSTlMA4CAQ70DAkM+gMIBgsHDQkEs4CzkAAAFCSURBVDjLjZXbsoMgDEUD4X6x9f9/9hjkwAA2uB+cdrLcCRADjEJts1DnqZyJGhhpe1FdyodfoDkXGfkAoq1R4W2MNn/qX4szKcXtcrSITHcWMRkHVUA9ve8LGxZSPCw5UTIVpuxOwoOkI7aFsJAIj0JixX/QVpJhbc2xLnPdnHsdtCeJPUTanLL664cHVqba0t5JHtW1WlXct7YKQW8qRcp8lAoin1+qUyRAqoC8HWMaSxfQ+WZw9Bi19lHhQZE1I+krquB6RIA3cEd5uBewh3MA0Y51q0zWO/VmRQ4YW+F4h+LSLnwFesPIocd5t/odmp1tan2q33yGNf5983G/Hxm91flBJOQ83tJK6jbeOlvGq5fLHG/kOopTo/GYR3GLfM9bLtOA92Ic8JPx07Xx62yCHy8jy19d0XzURYls9ZT6D8WaGTdYh6LBAAAAAElFTkSuQmCC" 
                        alt=""
                      />
                    </button>
                    <button className="flex items-center text-xs text-gray-500">
                      <img 
                        className="w-4 h-4 mr-1" 
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAANlBMVEUAAACIi5SHipOJi5SDi5KHiZOIipSIi5SHipWIipSIi5SHi5SHipKIi5SHipSHi5SHipWIi5Sigds/AAAAEXRSTlMA3yDvEECgwGCQgM9gULBwMIDGfEcAAAEzSURBVDjLtZTdtoQgCIUNULOyn/d/2aNxitJGmovZFylrfW4RTPNrQZwmuxYx1BwN3barc7BzASW+g9tFDihc40BCwu4o6soY7iSGydroDkpiZoXE4dil54XLYbSgsO6cytKxiDefZxOTF1FwaYuCtWmSx2iastmWB2cU+d02sLluG/ICNKowZcAfVXM6ulFTPQv6DYqM6gmgya3RUZ+onScVTfvPZnlb14Wr++ZUqzGdngFgKmsa878ytEBG+jQSNmzlEsKxZtYy5X0J2f9J5d2PaY7QOBM7yd9FjUSl9ZTD8ZGlsbABFLYmEYrOMVuRdd97eUSKPPlINXszsMhkpYjbrcX8GmL8VBYxthytH0ro/5/XBPLUU+MKMcwgLqYhmLdTHhqgPK+Sswr73rwTPW79BxPrGSWdVD53AAAAAElFTkSuQmCC" 
                        alt=""
                      />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    内容由AI生成
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 条件渲染的移动端输入框 */}
      {isEffectiveSingle && <MobileInputBar />}
      
      </div>
    </div>
  );
}

// 所有复杂的解析函数已移除，现在使用react-markdown进行标准1:1渲染
