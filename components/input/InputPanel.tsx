'use client';

import React, { useState } from 'react';
import QueryInput from './QueryInput';
import MarkdownInput from './MarkdownInput';

interface InputPanelProps {
  queryValue: string;
  markdownValue: string;
  onQueryChange: (value: string) => void;
  onMarkdownChange: (value: string) => void;
  isProcessing?: boolean;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

/**
 * 输入面板容器 - 包含查询输入和Markdown输入
 * 对应原型图左侧的双输入面板布局
 */
export default function InputPanel({ 
  queryValue, 
  markdownValue, 
  onQueryChange, 
  onMarkdownChange, 
  isProcessing = false,
  showSidebar = true,
  onToggleSidebar
}: InputPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  return (
    <div className="input-panel h-full bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 标题和侧边栏切换按钮 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">编辑区</h2>
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              title="隐藏侧边栏"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* 查询输入 */}
        <QueryInput
          value={queryValue}
          onChange={onQueryChange}
          disabled={isProcessing}
        />

        {/* 快速测试（重构版） */}
        <QuickTests
          onSelect={(presetId) => setSelectedPreset(presetId)}
          selectedId={selectedPreset}
          onApply={(payload) => {
            onMarkdownChange(payload.content);
            onQueryChange(payload.title);
          }}
        />

        {/* Markdown输入 */}
        <MarkdownInput
          value={markdownValue}
          onChange={onMarkdownChange}
          disabled={isProcessing}
        />

        {/* 处理状态指示器 */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-gray-600"></div>
            <span className="ml-3 text-sm text-gray-600 font-medium">渲染中...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 重构后的“快速测试”区块
 */
function QuickTests({
  selectedId,
  onSelect,
  onApply,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (payload: { title: string; content: string }) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 预设用例集合（含远程与内置）
  const presets: Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'remote' | 'inline';
    source?: string; // remote path
    content?: string; // inline markdown
  }> = [
    {
      id: 'basic',
      title: '基础Markdown测试',
      subtitle: '标题/段落/列表/表格基础元素',
      type: 'remote',
      source: '/test-simple.md',
    },
    {
      id: 'ipad',
      title: '数字绘画二手 iPad 推荐',
      subtitle: '长文结构 + 列表/图片占位',
      type: 'remote',
      source: '/test-ipad.md',
    },
    {
      id: 'pants',
      title: '15-20 度轻薄冲锋裤推荐',
      subtitle: '两款对比 + 评分表格',
      type: 'inline',
      content: `# 15-20度轻薄冲锋裤推荐

这个温度区间确实是选择冲锋裤的"甜蜜点"，既需要一定的防护，又不能太厚重闷热。我专门研究了轻薄透气型冲锋裤的特点，为你找到了两款非常适合的选择，覆盖不同预算需求：

## 🏆 性价比之选：凯乐石软壳冲锋裤

[凯乐石软壳冲锋裤](<sku_id>10179034851442</sku_id>) **157元**

**核心优势：**
- **轻薄透气**：涤纶+腈纶混纺面料，配合Omni-Tech技术，防水防风的同时透气性出色
- **舒适版型**：用户反馈"面料很舒服，版型也很正，穿着显瘦"
- **速干性能**：有用户评价"速干性能很出色，雨天出行完全无压力"
- **性价比突出**：157元的价格在同类产品中极具竞争力

**适合人群**：注重性价比，偶尔户外活动或日常通勤使用的用户

---

## 🎯 专业高端选择：始祖鸟BETA系列

[始祖鸟BETA冲锋裤](<sku_id>10163790870156</sku_id>) **3000元**

**核心优势：**
- **顶级面料**：Gore-Tex技术 + 锦纶面料，轻量化硬壳的标杆产品
- **专业防护**：全天候防水防风性能，户外恶劣环境下表现出色  
- **品牌保障**：始祖鸟的品质标准和工艺细节，用户评价"大品牌，质量太好了"
- **轻薄耐用**：专为追求极致性能的户外爱好者设计

**适合人群**：经常户外活动，对装备品质有高要求的专业用户

---

## 📊 快速对比

| 特点 | 凯乐石软壳 | 始祖鸟BETA |
|------|------------|------------|
| **价格** | 157元 | 3000元 |
| **面料技术** | Omni-Tech | Gore-Tex |
| **使用场景** | 日常/轻度户外 | 专业户外 |
| **性价比** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **专业性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 💡 选购建议

对于15-20度的气温，这两款都能满足直接穿着的需求。**如果你是户外新手或预算有限**，凯乐石的性价比非常突出；**如果你经常进行户外活动且追求顶级品质**，始祖鸟的投资绝对值得。

记得选择时要考虑腰围尺码，冲锋裤通常建议选稍微宽松一点的版型，方便活动。你比较倾向于哪个价位区间呢？我可以进一步为你分析具体的尺码选择。`,
    },
    {
      id: 'laptop',
      title: '高性能笔记本推荐',
      subtitle: '三机型对比 + 表格',
      type: 'inline',
      content: `# 帮你找到了几款适合的高性能笔记本 💻

根据你的需求，我深入研究了即梦AI和问道5开的配置要求，发现即梦AI对内存和显卡要求较高（推荐32GB内存+4GB显存），问道5开则需要稳定的多核处理器。综合你的预算和使用场景，为你筛选出3款性价比很高的选择：

## 🏆 强烈推荐：[拯救者Y7000P](<sku_id>10168157834529</sku_id>)
**价格：3278元（在预算内）**

这款是我找到的最符合你需求的选择：
- **超强配置**：64GB内存（比你要求的32GB还多一倍）+ i7-14650HX 14代酷睿 + RTX4060独显
- **剪辑友好**：2560*1600高分辨率 + 165Hz刷新率 + 100% sRGB色域，视频剪辑显示效果很棒
- **散热出色**：用户反馈"散热性很好，玩游戏一点不卡"，长时间运行AI软件和游戏多开都很稳定
- **性价比超高**：99%好评率，3278元的价格配这个配置真的很划算

## 💼 品牌保障：[戴尔游匣G15](<sku_id>10142609044015</sku_id>)
**价格：4799元（超预算799元）**

如果你更看重品牌可靠性：
- **精准匹配**：32GB内存+1TB固态硬盘，完全按你的要求配置
- **稳定表现**：RTX4060独显+13代酷睿i7，用户反馈"运行流畅"被提及25次
- **品牌溢价**：戴尔在专业应用领域经验丰富，售后服务也更完善

## 🎯 专业稳定：[戴尔Pro15](<sku_id>10142991499863</sku_id>)
**价格：4099元（仅超预算99元）**

工作站定位，适合长时间专业工作：
- **护眼设计**：莱茵护眼认证屏幕，长时间剪辑不累眼
- **专业优化**：用户评价在CAD、PS等专业软件运行流畅
- **人性化功能**：人脸解锁+指纹解锁+背光键盘，使用体验很贴心

## 📋 配置对比表

| 型号 | 价格 | 内存 | 显卡 | 处理器 | 特色优势 |
|------|------|------|------|--------|----------|
| 拯救者Y7000P | 3278元 | 64GB | RTX4060 | i7-14650HX | 性价比王者，超强散热 |
| 戴尔游匣G15 | 4799元 | 32GB | RTX4060 | 13代i7 | 品牌可靠，配置精准 |
| 戴尔Pro15 | 4099元 | 32GB | 独显4GB | i7-10850H | 工作站级稳定性 |

## 💡 我的建议

**首推拯救者Y7000P**，原因是：
1. **预算友好**：完全在4000元预算内
2. **配置超预期**：64GB内存让你跑即梦AI和问道5开完全无压力
3. **长期使用**：优秀散热保证长时间高负载稳定运行

关于**分期付款**，这3款在京东都支持白条分期，你可以根据自己情况选择期数。

还有什么想了解的配置细节或使用场景吗？比如具体想了解哪款的散热表现或者屏幕效果？`,
    },
  ];

  const handleClick = async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    onSelect(presetId);

    try {
      setLoadingId(presetId);
      if (preset.type === 'remote' && preset.source) {
        const res = await fetch(preset.source);
        const text = await res.text();
        onApply({ title: preset.title, content: text });
      } else if (preset.type === 'inline' && preset.content) {
        onApply({ title: preset.title, content: preset.content });
      }
    } catch (e) {
      console.error('加载测试预设失败:', e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">快速测试</span>
        <button
          onClick={() => onApply({ title: '空白文档', content: '' })}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition"
          title="清空输入"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleClick(p.id)}
              aria-pressed={active}
              className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-md border min-h-[40px] transition-colors duration-150 select-none ${
                active
                  ? 'border-gray-300 bg-gray-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300'
              }`}
              title={p.subtitle || p.title}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] text-gray-700 border border-gray-200 flex-shrink-0">
                  {p.type === 'remote' ? 'R' : 'I'}
                </span>
                <span className="truncate">{p.title}</span>
              </span>
              {loadingId === p.id ? (
                <span className="inline-block w-3 h-3 ml-2 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              ) : active ? (
                <svg className="w-4 h-4 text-gray-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
