/**
 * 画布变换Hook - 支持自由缩放和拖拽功能
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebouncedCallback } from './use-debounced-value';

export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface CanvasTransformHookReturn {
  transform: CanvasTransform;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;

  // 缩放控制
  handleWheel: (e: WheelEvent) => void;
  setScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // 拖拽控制
  handleMouseDown: (e: React.MouseEvent) => void;

  // 视图控制
  resetView: () => void;
  fitToView: (containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) => void;

  // 工具函数
  getTransformStyle: () => React.CSSProperties;
  updateTransform: (newTransform: CanvasTransform) => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.1;
const WHEEL_SCALE_FACTOR = 0.005;

/**
 * 画布变换Hook
 */
export function useCanvasTransform(
  initialScale: number = 1,
  initialTranslateX: number = 0,
  initialTranslateY: number = 0,
  isCanvasMode: boolean = false
): CanvasTransformHookReturn {
  // 状态管理
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: initialScale,
    translateX: initialTranslateX,
    translateY: initialTranslateY,
  });

  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 拖拽相关状态
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
  });

  // 防抖的变换更新
  const [debouncedSetTransform] = useDebouncedCallback(setTransform, 16); // 60fps

  // 约束变换值的工具函数
  const constrainTransform = useCallback((newTransform: CanvasTransform): CanvasTransform => {
    return {
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, newTransform.scale)),
      translateX: newTransform.translateX,
      translateY: newTransform.translateY,
    };
  }, []);

  // 缩放控制
  const setScale = useCallback((newScale: number) => {
    setTransform(prev => constrainTransform({ ...prev, scale: newScale }));
  }, [constrainTransform]);

  const zoomIn = useCallback(() => {
    setTransform(prev => constrainTransform({
      ...prev,
      scale: prev.scale + SCALE_STEP
    }));
  }, [constrainTransform]);

  const zoomOut = useCallback(() => {
    setTransform(prev => constrainTransform({
      ...prev,
      scale: prev.scale - SCALE_STEP
    }));
  }, [constrainTransform]);

  // 滚轮缩放处理
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasRef.current) return;

    // 画布模式下，只有按下Ctrl/Cmd键时才进行缩放，否则保持正常滚动
    // 非画布模式下，需要Ctrl/Cmd键才能缩放
    if (!(e.ctrlKey || e.metaKey)) return;

    // 只有在缩放模式下才阻止默认行为
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform(prev => {
      const newScale = constrainTransform({
        ...prev,
        scale: prev.scale - e.deltaY * WHEEL_SCALE_FACTOR,
      }).scale;

      // 计算缩放比例差
      const scaleDiff = newScale / prev.scale;

      // 计算容器中心点
      const containerCenterX = rect.width / 2;
      const containerCenterY = rect.height / 2;

      // 鼠标相对于容器中心的偏移
      const mouseOffsetX = mouseX - containerCenterX;
      const mouseOffsetY = mouseY - containerCenterY;

      // 基于鼠标位置调整平移，使鼠标下的内容在缩放后保持不动
      const newTranslateX = prev.translateX + mouseOffsetX * (1 - scaleDiff);
      const newTranslateY = prev.translateY + mouseOffsetY * (1 - scaleDiff);

      return constrainTransform({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    });
  }, [constrainTransform, isCanvasMode]);

  // 鼠标拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只响应左键和中键
    if (e.button !== 0 && e.button !== 1) return;

    // 检查是否按下空格键或者是中键
    const isPanMode = e.button === 1 || e.shiftKey;

    if (!isPanMode && e.button !== 0) return;

    e.preventDefault();

    setIsDragging(true);
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startTranslateX: transform.translateX,
      startTranslateY: transform.translateY,
    };

    // 鼠标移动处理
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;

      debouncedSetTransform(prev => constrainTransform({
        ...prev,
        translateX: dragStateRef.current.startTranslateX + deltaX,
        translateY: dragStateRef.current.startTranslateY + deltaY,
      }));
    };

    // 鼠标释放处理
    const handleMouseUp = () => {
      setIsDragging(false);
      dragStateRef.current.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = isPanMode ? 'grabbing' : 'move';
    document.body.style.userSelect = 'none';
  }, [transform.translateX, transform.translateY, constrainTransform, debouncedSetTransform]);

  // 重置视图
  const resetView = useCallback(() => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  // 适应视图大小
  const fitToView = useCallback((
    containerWidth: number,
    containerHeight: number,
    contentWidth: number,
    contentHeight: number
  ) => {
    const scaleX = (containerWidth - 40) / contentWidth; // 留20px边距
    const scaleY = (containerHeight - 40) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1); // 最大不超过1倍

    setTransform({
      scale: constrainTransform({ scale: newScale, translateX: 0, translateY: 0 }).scale,
      translateX: 0,
      translateY: 0,
    });
  }, [constrainTransform]);

  // 获取变换样式
  const getTransformStyle = useCallback((): React.CSSProperties => {
    return {
      transform: `scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
      transformOrigin: 'center center',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    };
  }, [transform, isDragging]);

  // 添加滚轮事件监听
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查焦点是否在可编辑元素上（输入框、文本域等）
      const target = e.target as HTMLElement;
      const isEditableElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // 只在画布模式且焦点不在可编辑元素上时，才禁用空格键的默认滚动行为
      if (e.code === 'Space' && !e.repeat && !isEditableElement && isCanvasMode) {
        e.preventDefault();
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }


      // Ctrl/Cmd + +: 放大
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      }

      // Ctrl/Cmd + -: 缩小
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // 只在画布模式下处理空格键释放
      if (e.code === 'Space' && isCanvasMode) {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = '';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetView, zoomIn, zoomOut, isCanvasMode]);

  // 直接设置变换状态
  const updateTransform = useCallback((newTransform: CanvasTransform) => {
    setTransform(constrainTransform(newTransform));
  }, [constrainTransform]);

  return {
    transform,
    canvasRef,
    isDragging,
    handleWheel,
    setScale,
    zoomIn,
    zoomOut,
    handleMouseDown,
    resetView,
    fitToView,
    getTransformStyle,
    updateTransform,
  };
}