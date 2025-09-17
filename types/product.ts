/**
 * 商品数据类型定义
 */

export interface ProductInfo {
  /** SKU ID */
  skuId: string;
  /** 商品标题 */
  title: string;
  /** 商品副标题/理由 */
  subtitle?: string;
  /** 商品图片URL - 现在使用shimmer效果，此字段可选 */
  imageUrl?: string;
  /** 主价格 */
  price: number;
  /** 价格单位 */
  priceUnit: string;
  /** 价格标签（如：到手价） */
  priceLabel?: string;
  /** 商品标签 */
  tags?: string[];
  /** AI评价标签 */
  aiComment?: string;
  /** 商品链接 */
  productUrl?: string;
  /** 品牌logo图标URL */
  brandIconUrl?: string;
  /** 种草理由（如：700+人种草） */
  reason?: string;
  /** AI评价总结文本 */
  aiCommentText?: string;
  /** AI评价总结数量 */
  aiCommentCount?: string;
}

/**
 * 商品卡片Props
 */
export interface ProductCardProps {
  /** 商品信息 */
  product: ProductInfo;
  /** 是否显示调试边界 */
  showDebugBounds?: boolean;
}