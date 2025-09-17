import React from 'react';
import { ProductCardProps } from '@/types/product';
import Shimmer from '@/components/ui/Shimmer';

/**
 * 商品卡片组件
 * 完全基于线上HTML结构设计，1:1还原移动端展示效果
 */
export default function ProductCard({ product, showDebugBounds = false }: ProductCardProps) {
  // AI评价箭头图标（base64）
  const arrowIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAcBAMAAABi/9neAAAAFVBMVEUAAAD/SH//SID/SID/SoD/UID/SH8V4fo1AAAABnRSTlMA3yBAMBB3WutwAAAAM0lEQVQY02OgFDAroHDZhFC5iSjSjGko0kxiqNKKNJNGcBGKqS+J8CDC+3gChyWAuCAGAEYUCwam/KUHAAAAAElFTkSuQmCC";

  return (
    <div className={`skus-wrap ${showDebugBounds ? 'border border-green-300 bg-green-50 p-1' : ''}`}>
      <div className="adm-swiper adm-swiper-horizontal adm-swiper" style={{ '--slide-size': '100%', '--track-offset': '0%' } as React.CSSProperties}>
        <div className="adm-swiper-track adm-swiper-track-allow-touch-move">
          <div className="adm-swiper-track-inner" style={{ transform: 'none' }}>
            <div className="adm-swiper-slide adm-swiper-slide-active">
              <div className="adm-swiper-item swiper-slide">
                <div className="sku-item-wrap false">
                  <div className="normal-product-card-container sku-item-box" data-msgid={product.skuId}>

                    {/* 商品图片区域 */}
                    <div className="main-img-view">
                      <div className="sku-img-c">
                        <Shimmer
                          width="100%"
                          height="100%"
                          borderRadius="6px"
                          className="sku-img sku-img-new"
                        />
                        <div className="sku-img-mask"></div>
                      </div>
                    </div>

                    {/* 商品内容区域 */}
                    <div className="content-view">
                      {/* 商品标题 */}
                      <div className="main-title">
                        <div className="main_container" style={{ WebkitLineClamp: 2 }}>
                          {/* 品牌标签 */}
                          {product.brandIconUrl && (
                            <div className="tags">
                              <div className="tags_element_container">
                                <img
                                  className="icon_tag"
                                  src={product.brandIconUrl}
                                  alt=""
                                  style={{ visibility: 'visible' }}
                                />
                              </div>
                            </div>
                          )}
                          {product.title}
                        </div>
                      </div>

                      {/* 种草理由 */}
                      {product.reason && (
                        <div className="reason" style={{ color: 'rgb(140, 140, 140)' }}>
                          {product.reason}
                        </div>
                      )}

                      {/* 标签行 */}
                      <div className="tagsLine">
                        <div className="tags_element"></div>
                        {(product.aiCommentText || product.aiCommentCount) && (
                          <div className="ai_comment">
                            {product.aiCommentCount || product.aiCommentText}
                            <img className="arrow" src={arrowIcon} alt="" />
                          </div>
                        )}
                      </div>

                      {/* 价格行 */}
                      <div className="priceLine">
                        <div className="price_element">
                          <div className="price_element_container">
                            <div className="main_price">
                              <div className="price_container">
                                <span className="price_unit">{product.priceUnit}</span>
                                <div className="price_number">{product.price}</div>
                              </div>
                            </div>
                            {product.priceLabel && (
                              <div className="sub_price">{product.priceLabel}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}