import React from 'react';

/**
 * 模拟移动端底部的输入框组件
 * 该组件严格按照提供的HTML和CSS进行复刻
 */
const MobileInputBar: React.FC = () => {
  // 从提供的HTML中提取的Base64图片数据
  const topicIconSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAABXCAMAAABGFileAAAAP1BMVEUAAAAbGxsaGhocHBwaGhobGxsaGhobGxsgICAaGhoaGhoaGhobGxsbGxsbGxscHBwZGRkbGxsaGhocHBwaGhooJJpTAAAAFHRSTlMAIN9An7+AYBDvz69QkHAwcI9/b3fi+CsAAAQBSURBVFjD7ZntlqIwDEDpd2gLqNv3f9YlKdJiq6Xi2V97z9mRdeBOTEKEMrQBMUtn+RhWuFX3WcBwFfB3Hkqs9HBFqsbwFme+tD5Q+gkuWbeVyXCGTjPcK47r5j9jOA+/nU2Bej10VHI2XqwYPZW15OyLYEdpXg9bjOTHfU6EfD8c4MRQRxzrem8VzOZWDZ/SpfOgLfuYWt605uRmzs5pJ+jqchK3tVwM5xA8Eze1DjpOzJY4lUwPPehUPPjYYL2Dynxqtz97H/ihF7GfSrciTfuvxNCP2IN6TTEv/uJ3qVBFFoqSfVe8W7XF5PAt7pmJvCdk6sBvAV72BAsbqRUu1C7F5mdjZodZuMK0ed1rq03skheoVZWG4ccsQjAY/lOiyjMQmP/QUHybvStL7QKUrT9WLA5P3ICJb+AfanlpZE84XXJGGl4m5KTpH72L3jEV74wn7voaDjS8Ms0pRFW8QLGVXrvUvNqsLDC8eJmOSLoIiO2v4wg0hMS99kO9MZ6KsL4jBnmc7J5H8AgRDrBnwCofwvIwOdn2LkveA6zqRdhK3Qs8TnOFb5L3JiKwfYiYUrdk9Q48H6ks8gf32rYHo1eh1RrDllrIY0QL7hq9U1k3xRG2hlTw8p5+8bLo8PgpSm8c5d94B/zQQDUQFJ4+65XPeo/4OqPXM4seSqAjoyP7hEnJvd6M5AVGzHl+CbZXUsbIaPe9QTEwG4Vj7o0R1/thkSsOd8WNwouFU0ssG1B0J73Hriy8tIn/lm3b17xCIxidpS3T9s6BsM/tW82rc0ecJexjHujDIyaV4ZwXiwl0AFs3Ci9lLZ+3/J2Xq4iNXnRo8koMxtGOuZeO1WmWwBuvyQqmYucL8k7YnarwPtL1J435k17AEMhr8P9oHHLvo7hyK72s4hVYa2rQ9QfH6G3mBYmSCSPejovDwuY5UqrinTGrBhsIVgNG7zKviqHqkA4EdLndi9S8ayx+xl8LyjTukLx4nGL76YxHSeo7U3qVjDjcJoWnBFIXaRLm3tt+5U1efcw2jzfnlf613DLakzpZ0XvJK1O5jNm9fEk9qGaonhcUi9Ww5Y5zgzr6GqgxcysNpO9ViC/yyGP4z79DwI+FwACYUeF+yeJNhJX3b+Kn92/p1ov3ZaJ5KwxjuqfroXkrPIeNb8+UR32dIV0KmWvrD/zteom/vl5SzcQoLq3vFEw/WI+a6jeHT0R/yQj7ecUj8A4ruI6FRKzdxfXJS8tHcO9bqFUdTzhaWsKV3ra1vV4NqV8aCJes7VVof6rRmJFj3/MA9zzl3uDNLMvnF4oNDcbQSztYSkM/E5yfzeHHT51UZwY0WdtMPVLlofO7rw2fzktJrBpBcuvkqeexfwEfCLTGEqB8NgAAAABJRU5ErkJggg==";
  const sendMessageIconSrc = "data:image/png;base64,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";

  return (
    <div
      style={{
        // 核心定位与尺寸
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '83px', // 模拟 rem 单位，相对于390px宽度
        zIndex: 30,
        // 视觉样式
        backgroundColor: '#fff',
        borderTop: '0.5px solid rgba(0,0,0,.08)',
        // 内部布局
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {/* 主题图标 - 放在输入框外面的最左侧 */}
        <div style={{ width: '24px', height: '24px', marginRight: '12px', flexShrink: 0 }}>
          <img src={topicIconSrc} alt="topic icon" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* 文本输入区域 */}
        <div style={{ flex: 1, marginRight: '12px' }}>
          <div
            style={{
              backgroundColor: '#f7f8fc', // --gray-bg-color
              borderRadius: '18px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <textarea
              placeholder="请输入你的问题"
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                resize: 'none',
                fontSize: '14px',
                color: '#333',
                padding: 0,
                lineHeight: '1.4',
                maxHeight: '50px', // 允许多行，但限制高度
              }}
            />
          </div>
        </div>

        {/* 右侧发送按钮 */}
        <div style={{ width: '28px', height: '28px' }}>
          <img src={sendMessageIconSrc} alt="send message icon" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default MobileInputBar;
