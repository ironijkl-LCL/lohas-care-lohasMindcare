# Mindful Space — 香港人嘅數位禪修空間

> 唔係另一個 AI 聊天機械人。呢個係一個**跟你呼吸、知你焦慮、陪你共修**嘅 embodied AI。

## 🌿 咩係 Mindful Space？

Mindful Space 係一個 **Progressive Web App (PWA)**，結合生理感測、聲學引導、粵語情緒辨識，為香港人提供一個**端側運算、私隱優先**嘅數位禪修空間。

## ✨ 核心功能

| 功能 | 技術 | 為何唔同 |
|---|---|---|
| 🫀 **後鏡頭 PPG 心率感測** | `getUserMedia` + Canvas 色彩分析 | 唔使穿戴裝置，指尖按鏡頭 8 秒即知壓力 |
| 🎙️ **粵語情緒感知** | `SpeechRecognition` (zh-HK) + 三層詞典 | 聽得明「好chur」「燥底」「頂唔順」 |
| 🌬️ **呼吸聲紋同步** | `AudioContext` + `AnalyserNode` | App 跟你呼吸，唔係你跟 app |
| 🧠 **4 頻段雙耳腦波牽引** | Web Audio `OscillatorNode` + ChannelMerger | δ 深睡 / θ 冥想 / α 專注 |
| 🌤️ **情緒天氣圖** | 一週 moodLog 可視化 | 將情緒變成天氣 |
| 🌏 **集體共修場** | 本地心流模式（誠實，非假數字） | — |
| 🔒 **端側零知識加密** | 全部 localStorage，冇 server 明文 | 你嘅生理數據默認留喺你部手機 |

## 🛠️ 技術棧

- **PWA**：`manifest.json` + Service Worker（offline-first）
- **Web Audio API**：雙耳節律、呼吸聲紋分析
- **MediaDevices API**：後鏡頭 PPG、麥克風
- **SpeechRecognition API**：粵語情緒辨識
- **MediaSession API**：鎖屏背景播放
- **Notification API** + **Push API**：微練習提醒
- **無框架**：純 HTML / CSS / JS，冇 build step

## 📱 安裝

### 桌面 / Android
1. 用 Chrome / Edge 開 https://ironijki-LCL.github.io/lohas-care-lohasMindcare/
2. 網址列右側點「安裝」

### iOS
1. 用 Safari 開同上網址
2. 分享 → 加入主畫面

## 🔐 私隱

- 所有生理數據默認留喺你部手機（localStorage）
- 冇上傳到任何 server
- 冇第三方追蹤
- 詳見 [Privacy Policy](./privacy-policy.html)

## 📄 授權

- 程式碼：[MIT License](https://opensource.org/licenses/MIT)
- 音檔：CC0 / 原創（見 `audio/placeholder.txt`）

## 🚀 部署

本專案透過 **GitHub Pages** 自動部署。
Push 到 `main` branch → 自動 build → 發佈。

## 📬 聯絡

- GitHub: [@ironijki-LCL](https://github.com/ironijki-LCL)
- Email: （可選）

---

**Kimi 係你打字佢回你。Mindful Space 係你呼吸佢跟你。**
