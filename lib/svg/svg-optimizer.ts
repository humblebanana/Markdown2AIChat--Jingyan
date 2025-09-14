/**
 * SVG优化器 - 解决大文件性能问题的核心方案
 * 1. 预处理SVG，移除冗余内容
 * 2. 智能分割，只加载必要部分
 * 3. 缓存策略，避免重复处理
 */

interface OptimizedSVG {
  background: string; // 背景框架SVG
  definitions: string; // 样式定义部分
  contentMasks: Record<string, string>; // 内容区域遮罩
  metadata: {
    viewBox: { width: number; height: number };
    contentAreas: Record<string, { x: number; y: number; width: number; height: number }>;
  };
}

/**
 * SVG性能优化器
 */
export class SVGOptimizer {
  private cache: OptimizedSVG | null = null;
  
  /**
   * 优化SVG内容 - 只处理一次，后续使用缓存
   */
  async optimizeSVG(svgContent: string): Promise<OptimizedSVG> {
    if (this.cache) {
      return this.cache;
    }

    console.log('开始SVG优化处理...');
    
    // 1. 提取并缓存样式定义部分
    const definitions = this.extractDefinitions(svgContent);
    
    // 2. 创建优化的背景框架
    const background = this.createBackgroundFramework(svgContent);
    
    // 3. 生成内容区域遮罩
    const contentMasks = this.generateContentMasks();
    
    // 4. 提取元数据
    const metadata = this.extractMetadata(svgContent);
    
    this.cache = {
      background,
      definitions,
      contentMasks,
      metadata
    };
    
    console.log('SVG优化完成，已缓存');
    return this.cache;
  }

  /**
   * 提取SVG定义部分（渐变、滤镜等）
   */
  private extractDefinitions(svgContent: string): string {
    const defsMatch = svgContent.match(/<defs[^>]*>([\s\S]*?)<\/defs>/);
    return defsMatch ? `<defs>${defsMatch[1]}</defs>` : '<defs></defs>';
  }

  /**
   * 创建优化的背景框架 - 移除文本但保留视觉效果
   */
  private createBackgroundFramework(svgContent: string): string {
    let framework = svgContent;
    
    // 移除文本元素但保留形状和样式
    framework = framework.replace(/<text[^>]*>[\s\S]*?<\/text>/gi, '');
    framework = framework.replace(/<tspan[^>]*>[\s\S]*?<\/tspan>/gi, '');
    
    // 保留所有视觉元素：rect, circle, path, g等
    // 这些元素提供了丰富的视觉效果
    
    return framework;
  }

  /**
   * 生成内容区域遮罩 - 基于原始照片分析
   */
  private generateContentMasks(): Record<string, string> {
    return {
      statusBar: this.createMaskSVG(0, 0, 374, 44),
      mainTitle: this.createMaskSVG(20, 60, 334, 50),
      subtitle: this.createMaskSVG(20, 120, 334, 40), 
      mainContent: this.createMaskSVG(20, 180, 334, 300),
      bulletList: this.createMaskSVG(30, 500, 314, 200),
      tableArea: this.createMaskSVG(20, 720, 334, 300),
      numberedList: this.createMaskSVG(20, 1040, 334, 150)
    };
  }

  /**
   * 创建区域遮罩SVG
   */
  private createMaskSVG(x: number, y: number, width: number, height: number): string {
    return `
      <rect x="${x}" y="${y}" width="${width}" height="${height}" 
            fill="transparent" stroke="none"/>
    `;
  }

  /**
   * 提取SVG元数据
   */
  private extractMetadata(svgContent: string) {
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const [vx, vy, width, height] = viewBoxMatch 
      ? viewBoxMatch[1].split(' ').map(Number)
      : [0, 0, 374, 2250];

    return {
      viewBox: { width, height },
      contentAreas: {
        statusBar: { x: 0, y: 0, width: 374, height: 44 },
        mainTitle: { x: 20, y: 60, width: 334, height: 50 },
        subtitle: { x: 20, y: 120, width: 334, height: 40 },
        mainContent: { x: 20, y: 180, width: 334, height: 300 },
        bulletList: { x: 30, y: 500, width: 314, height: 200 },
        tableArea: { x: 20, y: 720, width: 334, height: 300 },
        numberedList: { x: 20, y: 1040, width: 334, height: 150 }
      }
    };
  }

  /**
   * 清除缓存 - 开发时使用
   */
  clearCache(): void {
    this.cache = null;
    console.log('SVG缓存已清除');
  }
}

/**
 * 全局SVG优化器实例
 */
export const svgOptimizer = new SVGOptimizer();

/**
 * 快速获取优化后的SVG
 */
export async function getOptimizedSVG(): Promise<OptimizedSVG> {
  try {
    const response = await fetch('/svg.txt');
    const svgContent = await response.text();
    return svgOptimizer.optimizeSVG(svgContent);
  } catch (error) {
    console.error('SVG优化失败:', error);
    throw error;
  }
}