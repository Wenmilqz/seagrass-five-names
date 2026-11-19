# 一株草，五种名字 · One Plant, Five Names

> B 赛道 · 蓝色数字传播 · 交互式网页
> 第二届“蓝色创想·以语为桥”跨文化创新实践大赛 · 山东大学翻译学院

一个滚动叙事的数据故事：山东荣成的大叶藻（鳗草），屋顶上是海草房非遗，海底是正在消失的海草床。同一株草，在中文、英文、法文、俄文、日文里有五个名字，五种看它的方式。

## 目录

```
index.html                 单页入口（无构建步骤）
assets/css/style.css       全部样式
assets/js/main.js          滚动叙事、计数器、名字卡、中英切换
assets/photos/             两张 CC0 / 公有领域照片
```

## 本地预览

直接双击 `index.html` 即可。若要用本地服务器（更接近线上环境）：

```powershell
python -m http.server 8000
# 打开 http://localhost:8000
```

## 在线地址

**https://wenmilqz.github.io/seagrass-five-names/**

仓库：https://github.com/Wenmilqz/seagrass-five-names

已部署完成。后续改内容，直接在 GitHub 网页上编辑文件并 Commit，Pages 约 1 分钟后自动重建；不需要再执行 git 命令。

> 国内访问 GitHub Pages 偶尔不稳；录屏时用本地 `index.html` 最稳，对外链接仍用 Pages。

## 改文案 / 改数据

- 中文、英文都直接写在 `index.html` 里：`<span class="zh">…</span>` 与 `<span class="en">…</span>` 成对出现。
- 数字在 `data-count` 属性里；单位与说明在相邻元素。
- 每条数据必须能在 `docs/data-card.md` 找到来源；新增数据先补来源再上页面。

## 交互清单（写“作品说明”时对照）

1. 滚动进度条 + 右侧章节导航
2. 逐屏 reveal（IntersectionObserver）
3. 数字计数器（650 / 80% / 110 万 / 1,250 亩）
4. 100 株草的“消失”可视化
5. 五张名字卡翻转（点击 / 键盘）
6. 中英一键切换（localStorage 记忆）
7. 修复条形图生长
8. 海底照片视差 + 海草摆动
9. 环境音开关：Web Audio 实时合成的海浪、低频铺底与稀疏钟音，无外部音源；默认静音，点击后淡入

## 无障碍与性能

- 语义化 section / figure / figcaption；图片有 alt；名字卡可键盘操作。
- `prefers-reduced-motion` 下关闭动效。
- 图片 900px/1400px 两档 srcset，首屏不加载第二屏图片。
- 无外部字体、无 CDN、无追踪脚本，离线可开。
