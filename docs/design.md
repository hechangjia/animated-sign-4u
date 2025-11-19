# **SVG Signature Service (S3) \- 全栈技术规格说明书**

版本: 2.0  
状态: 规划/重构  
目标: 构建一个集 "在线可视化设计" 与 "API 自动化调用" 于一体的动态签名服务。

## **1\. 系统架构概览**

本项目分为两个核心子系统，共享核心的 SVG 生成算法与主题配置。

### **1.1 双模态架构**

| 模态 | Web Editor (前端) | Public API (服务端) |
| :---- | :---- | :---- |
| **定位** | 可视化设计工具、API URL 构建器 | 自动化服务、动态图片托管 |
| **运行环境** | 浏览器 (Client-side JS) | Vercel Serverless (Node.js) |
| **依赖核心** | DOM API (getTotalLength) | 数学库 (svg-path-properties) |
| **输出** | 实时预览 DOM, Copy Code | SVG 文件流 (image/svg+xml) |
| **主要场景** | 用户自定义设计，导出组件代码 | GitHub Readme, 动态引用 |

## **2\. 前端设计 (Web Editor)**

前端采用现代化的 Dashboard 布局，强调“配置即预览”。

### **2.1 界面布局 (Layout)**

界面分为三个主要区域，支持响应式布局。

\+---------------------------------------------------------------+  
|  Header: Logo, Title, \[Export Dropdown\], \[Download SVG\]       |  
\+-----------------------+---------------------------------------+  
|                       |                                       |  
|  Sidebar (Scrollable) |  Main Preview Area (Flexible)         |  
|                       |  \+---------------------------------+  |  
|  1\. Content & Font    |  |                                 |  |  
|  2\. Style & Color     |  |      \[ SVG Canvas \]             |  |  
|  3\. Themes (Grid)     |  |      (Centered, Shadowed)       |  |  
|  4\. Params            |  |                                 |  |  
|                       |  \+---------------------------------+  |  
|                       |                                       |  
|                       |  \[Resizer Handle\] \------------------  |  
|                       |                                       |  
|                       |  Code Panel (Bottom)                  |  
|                       |  \[ SVG / React / Vue / HTML Code \]    |  
|                       |                                       |  
\+-----------------------+---------------------------------------+

### **2.2 核心模块与交互**

#### **A. 状态管理 (State Management)**

前端维护一个单一数据源 state 对象。所有 UI 组件（Input, Slider, Toggle）均为受控组件。

*关键代码引用 (signature\_generator.html):*

let state \= {  
    text: 'yunique',  
    font: 'great-vibes',  
    fillMode: 'gradient', // single, gradient, multi  
    texture: 'grid',      // none, grid, dots...  
    charColors: \[\],       // 逐字颜色数组  
    // ...  
};

#### **B. 交互逻辑 (Interaction Flow)**

1. **输入监听**: 监听 input/change 事件。  
2. **状态更新**: 修改 state 对象。  
3. **防抖处理 (Debounce)**: 避免高频输入导致重绘卡顿。  
4. **SVG 重绘**: 重新计算路径 \-\> 生成 SVG String \-\> innerHTML 注入。

#### **C. 组件导出器 (Component Exporter)**

不仅导出 SVG 字符串，还根据当前配置（背景、圆角、阴影）生成封装好的 React/Vue 组件代码。

*代码逻辑:*

function exportComponent(type) {  
    // 1\. 获取当前生成的 Clean SVG  
    // 2\. 根据 type 包装 Template (React Function / Vue Template)  
    // 3\. 将 state.borderRadius, state.bg 转换为内联样式  
    // 4\. 输出到 CodePanel  
}

## **3\. API 设计 (Public Service)**

后端旨在提供类似 Shields.io 的服务。用户只需拼接 URL 即可获得与前端编辑器效果一致的 SVG。

### **3.1 接口定义**

**Endpoint**: GET /api/v1/sign

**请求参数 (Query Params):**

| 参数 | 类型 | 说明 | 示例 |
| :---- | :---- | :---- | :---- |
| text | string | 签名内容 | Hello%20World |
| font | string | 字体 ID | pacifico |
| theme | string | 预设主题 | cyber |
| bg | string | 背景色 (支持 hex 或 'transparent') | 000000 |
| texture | string | 纹理类型 | cross |
| dark | boolean | 是否开启暗色模式适配 (预留) | true |

**响应头 (Response Headers):**

* Content-Type: image/svg+xml  
* Cache-Control: s-maxage=86400, immutable (利用 CDN 强缓存)

### **3.2 核心重构：去 DOM 化 (De-DOMing)**

这是将前端代码移植到后端的**最关键步骤**。前端依赖浏览器 DOM 来测量字体路径长度（用于书写动画），后端 Node.js 环境无 DOM。

**算法变更对比:**

| 步骤 | 前端 (Browser) | 后端 (Node.js) |
| :---- | :---- | :---- |
| **1\. 字体解析** | opentype.load(url) (XHR) | opentype.load(file) (FS/Cache) |
| **2\. 路径生成** | glyph.getPath(...).toPathData() | glyph.getPath(...).toPathData() (不变) |
| **3\. 长度测量** | document.createElement('path').getTotalLength() | **new svgPathProperties(d).getTotalLength()** |
| **4\. 组装** | Template String \-\> innerHTML | Template String \-\> res.send() |

**后端伪代码 (Handler):**

import { svgPathProperties } from 'svg-path-properties'; // 数学库替代 DOM

// ... 获取 pathData (d) 后 ...

// OLD (Frontend):  
// measureSvg.appendChild(el); const len \= el.getTotalLength();

// NEW (Backend):  
const properties \= new svgPathProperties(d);  
const len \= Math.ceil(properties.getTotalLength()); // 纯数学计算

// ... 继续组装 SVG ...

## **4\. 共享逻辑与配置 (Shared Core)**

为了保证前端编辑器看到的预览与 API 生成的结果完全一致，必须抽离共享配置。

### **4.1 主题配置文件 (themes.json)**

将前端硬编码的 themes 对象提取为 JSON。

{  
  "cyber": {  
    "bg": "\#0f172a",  
    "stroke": "\#facc15",  
    "fillMode": "gradient",  
    "gradientColors": \["\#facc15", "\#d946ef"\],  
    "texture": "cross",  
    "glow": true  
  },  
  "school": {  
    "texture": "lines",  
    "texColor": "\#e2e8f0"  
  }  
}

### **4.2 纹理生成器 (Texture Generator)**

纹理生成是纯字符串拼接，应提取为独立 Utility 函数，供前后端共用。

// shared/textureUtils.js  
export function getTextureDefs(type, color, size, opacity) {  
    if (type \=== 'grid') {  
        return \`\<pattern ...\>\<path d="M ${size} 0 L 0 0 0 ${size}" stroke="${color}" ... /\>\</pattern\>\`;  
    }  
    // ... support dots, lines, cross  
    return '';  
}

## **5\. 数据流转图 (Data Flow)**

### **场景 A: 用户在网站上编辑**

\[User\] \--(Input Text/Color)--\> \[Frontend State\]  
                                     |  
                                     v  
                          \[Debounce Timer (50ms)\]  
                                     |  
                                     v  
                        \[Core: Generate SVG String\]  
                        (Using Browser Opentype \+ DOM Measure)  
                                     |  
                                     \+---\> \[Preview Area (innerHTML)\]  
                                     |  
                                     \+---\> \[Code Panel (React/Vue String)\]

### **场景 B: 用户调用 API**

\[User/Github\] \--(GET /api/sign?theme=cyber)--\> \[Vercel Edge Cache\]  
                                                      |  
                                         (Cache Miss) v  
                                          \[Serverless Function\]  
                                                      |  
                                 \+--------------------+--------------------+  
                                 |                                         |  
                          \[Load Font\]                             \[Load Theme Config\]  
                        (Cache/FS/CDN)                                     |  
                                 |                                         |  
                                 v                                         v  
                        \[Core: Generate SVG String\] \<----------------------+  
                        (Using Opentype \+ svg-path-properties)  
                                 |  
                                 v  
                        \[Response: image/svg+xml\] \--\> \[Update Cache\]

## **6\. 优化与迭代路线**

1. **字体服务优化**:  
   * 中文字体通过 **Google Fonts API 切片 (Subsetting)** 获取，仅下载用户输入的字符对应的字体包，避免 Serverless 函数体积超限。  
2. **API 构建器**:  
   * 在前端编辑器中增加一个 "Copy API URL" 按钮。根据当前 UI 上的配置（颜色、主题、文字），自动拼接出对应的 API 调用链接。  
   * 例如：https://sign.yunique.cc/api/sign?text=Cool\&fill=gradient\&c1=ff0000\&c2=0000ff  
3. **多格式支持**:  
   * 支持 \&format=json 返回 path data 数据，供高级开发者二次开发。  
   * 支持 \&format=png (使用 sharp 库在服务端将 SVG 转为 PNG，用于不支持 SVG 的平台)。