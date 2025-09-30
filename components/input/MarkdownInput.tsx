'use client';

import React from 'react';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Markdown内容输入组件 - 对应原型图下方的大输入框
 */
export default function MarkdownInput({ 
  value, 
  onChange, 
  placeholder = "粘贴Markdown内容...", 
  disabled = false 
}: MarkdownInputProps) {
  return (
    <div className="markdown-input-container">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-800">
          Markdown内容
        </label>
        <div className="flex items-center gap-2">
          {/* Markdown标准语法说明 */}
          <div className="relative group" aria-label="Markdown标准语法">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md cursor-default select-none">
              支持标准语法
            </span>
            {/* Tooltip: Markdown语法快速参考 */}
            <div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[95vw] max-h-[85vh] hidden group-hover:block group-focus-within:block z-[9999] pointer-events-none"
            >
              <div className="rounded-lg border border-gray-200 shadow-2xl bg-white p-4 text-[12px] leading-5 text-gray-700 overflow-auto max-h-[85vh] pointer-events-auto">
                <div className="font-semibold text-gray-900 mb-3 text-sm">Markdown 标准语法快速参考</div>
                <div className="space-y-3">
                  {/* 标题 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">标题</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      # 一级标题<br />
                      ## 二级标题<br />
                      ### 三级标题
                    </div>
                  </div>

                  {/* 文本格式 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">文本格式</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      **粗体** 或 __粗体__<br />
                      *斜体* 或 _斜体_<br />
                      `代码`
                    </div>
                  </div>

                  {/* 列表 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">列表</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      - 无序列表项<br />
                      * 无序列表项<br />
                      1. 有序列表项<br />
                      2. 有序列表项
                    </div>
                  </div>

                  {/* 链接和图片 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">链接和图片</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      [链接文本](https://example.com)<br />
                      ![图片描述](图片URL)
                    </div>
                  </div>

                  {/* 引用 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">引用</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      &gt; 引用文本
                    </div>
                  </div>

                  {/* 代码块 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">代码块</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      ```<br />
                      代码块内容<br />
                      ```
                    </div>
                  </div>

                  {/* 表格 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">表格</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      | 列1 | 列2 |<br />
                      |-----|-----|<br />
                      | 内容 | 内容 |
                    </div>
                  </div>

                  {/* 分割线 */}
                  <div>
                    <div className="text-gray-700 font-medium mb-1 text-[13px]">分割线</div>
                    <div className="font-mono text-[11px] bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      ---
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 帮助：商品卡片格式说明 */}
          <div className="relative group" aria-label="商品卡片格式帮助">
            <div
              className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center text-[12px] cursor-default select-none"
              title="商品卡片渲染格式"
            >
              ?
            </div>
            {/* Tooltip */}
            <div
              className="absolute right-0 top-full mt-2 w-[520px] max-w-[92vw] hidden group-hover:block group-focus-within:block z-50"
            >
              <div className="rounded-md border border-gray-200 shadow-xl bg-white p-3 text-[12px] leading-5 text-gray-700 max-h-[70vh] overflow-auto break-words">
                <div className="font-semibold text-gray-900 mb-1">商品卡片渲染格式</div>
                <div className="space-y-1">
                  <div>支持在 Markdown 中插入商品卡片：</div>
                  <div className="space-y-1">
                    <span className="text-gray-500">完整格式：</span>
                    <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap">
                      {`[sku_name](<sku_id>sku_id</sku_id>)[price][img_url]`}
                    </div>
                  </div>
                  <div className="text-gray-600">说明：<span className="text-gray-500">price 和 img_url 可选</span></div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      仅 SKU：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">{`[标题](<sku_id>10147798291074</sku_id>)`}</div>
                    </li>
                    <li>
                      带价格：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">{`[标题](<sku_id>10147798291074</sku_id>)[¥3999]`}</div>
                    </li>
                    <li>
                      带价格和图片：
                      <div className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded break-all whitespace-pre-wrap inline-block mt-0.5">
                        {`[iPad Air 4](<sku_id>10147798291074</sku_id>)[3999][https://img13.360buyimg.com/n1/jfs/t1/100840/35/29773/163491/62949eeeE449ab513/2cf9c84c0ce30292.jpg]`}
                      </div>
                    </li>
                  </ul>
                  <div className="text-gray-500 mt-1">
                    价格示例：{`¥299 / 299元 / $29.99`}; 未提供图片时会自动使用稳定随机图。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-96 h-[28rem] px-4 py-3 bg-white border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:bg-gray-50 disabled:text-gray-500 font-mono transition-all duration-200 shadow-sm hover:border-gray-300"
        style={{
          fontSize: '13px',
          lineHeight: '1.5',
          fontFamily: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        }}
      />
      {/* 字符统计 */}
      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{value.length} 字符</span>
          <span>{value.split('\n').length} 行</span>
        </div>
        <div className="text-gray-400">
          实时预览
        </div>
      </div>
    </div>
  );
}
