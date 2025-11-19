# 元素位置文档

## 设计稿尺寸
- **宽度**: 394px
- **高度**: 852px
- **设备**: iPhone 16 (393×852px)

## 颜色变量
```css
--e-3d-095: rgba(227, 208, 149, 0.81)  /* 米黄色文字 */
--x-0e-2148: rgba(14, 33, 72, 1)        /* 深蓝色背景 */
白色: #ffffff                            /* 底部文字 */
黑色: #000000                            /* 表盘背景 */
```

## 字体
- **字体族**: "Ubuntu Condensed-Regular", "Ubuntu Condensed", Helvetica, sans-serif

---

## 元素位置清单

### 1. 顶部月相名称 (moon label)
- **位置**: `left: 10px`, `top: 10px`
- **尺寸**: `width: 196px`, `height: 111px`
- **字体**: `font-size: 64px`, `line-height: 111.4px`
- **颜色**: `var(--e-3d-095)`
- **对齐**: 居中
- **rem换算**: `left: 0.1rem`, `top: 0.1rem`, `width: 1.96rem`, `height: 1.11rem`, `font-size: 0.64rem`

### 2. 中间圆形表盘 (dial)
- **位置**: 居中 (`top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`)
- **尺寸**: `width: 318px`, `height: 318px` (估算，需确认)
- **背景**: `#000000` (黑色)
- **rem换算**: `width: 3.18rem`, `height: 3.18rem`

### 3. 表盘中心月亮图标 (moon circle)
- **位置**: 表盘中心 (`top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`)
- **尺寸**: `width: 81px`, `height: 81px`
- **圆角**: `border-radius: 40.5px`
- **背景**: `var(--e-3d-095)`
- **rem换算**: `width: 0.81rem`, `height: 0.81rem`, `border-radius: 0.405rem`

### 4. 左侧时间 (time1)
- **位置**: `left: 0px`, `top: 0px` (相对于时间容器)
- **尺寸**: `width: 56px`, `height: 28px`
- **字体**: `font-size: 24px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `left: 0`, `width: 0.56rem`, `height: 0.28rem`, `font-size: 0.24rem`
- **注意**: 实际top位置需要根据时间容器位置计算

### 5. 中间描述文字 (累计时间)
- **位置**: `left: 116px`, `top: 7px` (相对于时间容器)
- **尺寸**: `width: 127px`, `height: 14px`
- **字体**: `font-size: 12px`
- **颜色**: `var(--e-3d-095)`
- **效果**: `filter: blur(0.5px)`
- **rem换算**: `left: 1.16rem`, `top: 0.07rem`, `width: 1.27rem`, `height: 0.14rem`, `font-size: 0.12rem`

### 6. 右侧时间 (time2)
- **位置**: `left: 303px`, `top: 0px` (相对于时间容器)
- **尺寸**: `width: 52px`, `height: 28px`
- **字体**: `font-size: 24px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `left: 3.03rem`, `width: 0.52rem`, `height: 0.28rem`, `font-size: 0.24rem`

### 7. 可见度信息区域 (frame)
- **位置**: 居中 (`left: 50%`, `transform: translateX(-50%)`)
- **尺寸**: `width: 234px`, `height: 167px`
- **rem换算**: `width: 2.34rem`, `height: 1.67rem`
- **注意**: 实际top位置需要根据布局计算

#### 7.1 大号数字 (text-wrapper)
- **位置**: `left: 0px`, `top: 0px` (相对于frame)
- **字体**: `font-size: 96px`, `line-height: 167px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `font-size: 0.96rem`, `line-height: 1.67rem`

#### 7.2 方向文字 (can-be-seen-at-east)
- **位置**: `left: 97px`, `top: 36px` (相对于frame)
- **尺寸**: `width: 137px`, `height: 88px`
- **字体**: `font-size: 32px`, `line-height: 43.5px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `left: 0.97rem`, `top: 0.36rem`, `width: 1.37rem`, `height: 0.88rem`, `font-size: 0.32rem`

#### 7.3 百分号 (div)
- **位置**: `left: 97px`, `top: 90px` (相对于frame)
- **尺寸**: `height: 35px`
- **字体**: `font-size: 20px`, `line-height: 34.8px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `left: 0.97rem`, `top: 0.9rem`, `height: 0.35rem`, `font-size: 0.2rem`

#### 7.4 位置天气 (text-wrapper-2)
- **位置**: `left: calc(50% - 64px)`, `top: 141px` (相对于frame)
- **尺寸**: `height: 27px`
- **字体**: `font-size: 20px`, `line-height: 27.2px`
- **颜色**: `var(--e-3d-095)`
- **rem换算**: `left: calc(50% - 0.64rem)`, `top: 1.41rem`, `height: 0.27rem`, `font-size: 0.2rem`

### 8. 底部固定文字 (结束句)
- **位置**: `left: 81px`, `top: 811px`
- **尺寸**: `width: 237px`, `height: 14px`
- **字体**: `font-size: 12px`
- **颜色**: `#ffffff`
- **rem换算**: `left: 0.81rem`, `top: 8.11rem`, `width: 2.37rem`, `height: 0.14rem`, `font-size: 0.12rem`

---

## 缺失的位置信息

以下元素的位置需要从实际图片中测量：

1. **时间信息容器的top位置** - 当前估算为 `top: 6.73rem` (673px)
2. **可见度信息容器的top位置** - 当前估算为 `top: 7.04rem` (704px)
3. **圆形表盘的确切尺寸和位置** - 当前估算为居中，`width: 3.18rem`

---

## Rem换算规则

设计稿宽度：394px
基准：1rem = 100px (在394px设计稿上)

换算公式：`N px = (N / 100) rem`

例如：
- 10px = 0.1rem
- 64px = 0.64rem
- 196px = 1.96rem
- 394px = 3.94rem


