# 交接清单：现在只剩 4 件事

> 页面已完成，并通过 1440×1000 桌面与 390×844 手机截图检查。
> 现在时间约 12:00，截止 24:00。以下四件事约 3–4 小时，建议 22:30 前发出。

## 1. 内容过一遍（30–45 分钟，必须做）

这不是形式。**AI 创作说明里写了“团队重写全部中文文案、英文逐句校对”，你要真的做一遍，说明才成立。**

- 逐屏读中文：改掉你不认同的措辞，尤其是“锁碳”“一条链子上的四个环”这类比喻。
- 逐句读英文：`index.html` 里所有 `<span class="en">` 与 `<p class="en">`。重点看 `eelgrass / zostère / взморник` 的解释是否准确。
- 如果团队还用了别的 AI 工具（翻译、绘图、写作），补进 `docs/submission.md` 的 AI 说明。
- 改完刷新页面，切到 EN 再读一遍。

## 2. 部署拿链接（20 分钟）

```powershell
cd C:\Users\38397\Desktop\蓝色B2
git init
git add .
git commit -m "seagrass scroll story"
git branch -M main
git remote add origin https://github.com/Wenmilqz/seagrass-five-names.git
git push -u origin main
```

GitHub 仓库 → **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**。
1–2 分钟后访问：

```
https://wenmilqz.github.io/seagrass-five-names/
```

- 先在**无痕窗口**打开，再用手机 4G 打开一次。
- 国内访问 GitHub Pages 偶尔慢；录屏时用本地 `index.html`，对外链接仍用 Pages。
- 如果 GitHub 登录/推送卡住：把整个文件夹拖到 Netlify Drop，或传到 Cloudflare Pages，拿到任何公开链接都算数。

## 3. 录屏（30–60 分钟）

按 `docs/recording-script.md` 的分镜表录 90–120 秒，1080p，中文字幕。
字幕文件 `docs/subtitles.srt` 可直接导入剪映。

- 窗口 1440×900，F11 全屏，关书签栏。
- 先本地打开 `index.html` 录，避免网络卡顿。
- 关键数字停 1–2 秒；名字卡点开 2–3 张即可。
- 文件名：`B赛道+队长姓名+海草房与海草床.mp4`。

## 4. 打包发邮件（20 分钟）

```
蓝色创想+B赛道+组一辈子乐队.zip
├── B赛道+队长姓名+海草房与海草床.mp4
├── B赛道+队长姓名+作品说明.docx
├── B赛道+队长姓名+AI创作说明.docx
├── 源代码/            （index.html + assets/）
└── 演示链接.txt        （Pages 地址）
```

- 邮件主题：`蓝色创想+B赛道+组一辈子乐队`
- 收件：fanyuan_keyan@163.com
- 作品说明与 AI 说明的正文在 `docs/submission.md`，复制进 Word 即可（字数已卡在 200–400 / 300–500 区间）。
- 报名表按学院要求另附。

## 队长姓名待补

你说先空着。最后把三处 `队长姓名` 替换成真实姓名即可（页面本身不需要写队长姓名）。

## 提交前 60 秒自检

- [ ] 中英切换后没有漏译、没有半截句子
- [ ] 页面里每个数字都能在 `docs/data-card.md` 找到来源
- [ ] 链接无痕可开、手机可开
- [ ] 录屏能播、字幕错字已改
- [ ] 压缩包解压后文件名不乱码
- [ ] 邮件主题、压缩包名、文件名三处一致
