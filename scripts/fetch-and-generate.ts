import { XAuthClient } from "./utils";
import { get } from "lodash";
import dayjs from "dayjs";
import fs from "fs-extra";
// 可以获取关注作者的推文，并发布为HTML页面。二合一。
// Define our own tweet data type
interface CustomTweetData {
  user: {
    screenName: string;
    name: string;
    profileImageUrl: string;
    description: string;
    followersCount: number;
    friendsCount: number;
    location: string;
  };
  images: string[];
  videos: string[];
  tweetUrl: string;
  fullText: string;
  createdAt: string;
  favoriteCount: number;
  retweetCount: number;
  replyCount: number;
  hashtags: any[];
  mentions: any[];
}

// HTML转义函数
function escapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}
/* 
// 生成推文卡片HTML
function generateTweetCard(tweet: CustomTweetData, index: number): string {
  const imageHtml = tweet.images && tweet.images.length > 0 
    ? `<img src="${tweet.images[0]}" alt="推文图片" class="tweet-image" onclick="openImageModal('${tweet.images[0]}')">` 
    : '';
  
  const hiddenClass = index >= 20 ? ' style="display: none;"' : '';
  
  return `<div class="tweet-card"${hiddenClass}>
                <div class="tweet-header">
                    <img src="${tweet.user.profileImageUrl}" alt="${escapeHtml(tweet.user.name)}" class="avatar">
                    <div class="user-info">
                        <h2>${escapeHtml(tweet.user.name)}</h2>
                        <p>@${escapeHtml(tweet.user.screenName)}</p>
                    </div>
                </div>
                <div class="tweet-content">
                    <div class="tweet-text">${escapeHtml(tweet.fullText)}</div>
                    ${imageHtml}
                </div>
                <div class="tweet-stats">
                    <span>❤️ ${tweet.favoriteCount || 0}</span>
                    <span>🔄 ${tweet.retweetCount || 0}</span>
                    <span>💬 ${tweet.replyCount || 0}</span>
                    <span>👁️ ${(tweet.user.followersCount || 0).toLocaleString()}</span>
                </div>
                <a href="${tweet.tweetUrl}" target="_blank" class="tweet-link">查看原文</a>
            </div>`;
}
*/
// 生成推文卡片HTML
function generateTweetCard(tweet: CustomTweetData, index: number): string {
    const imageHtml = tweet.images && tweet.images.length > 0 
      ? `<img src="${tweet.images[0]}" alt="推文图片" class="tweet-image" onclick="openImageModal('${tweet.images[0]}')">` 
      : '';
    
    const videoHtml = tweet.videos && tweet.videos.length > 0 
      ? `<video src="${tweet.videos[0]}" class="tweet-video" controls preload="metadata">
           您的浏览器不支持视频播放。
         </video>` 
      : '';
    
    const hiddenClass = index >= 20 ? ' style="display: none;"' : '';
    
    return `<div class="tweet-card"${hiddenClass}>
                  <div class="tweet-header">
                      <img src="${tweet.user.profileImageUrl}" alt="${escapeHtml(tweet.user.name)}" class="avatar">
                      <div class="user-info">
                          <h2>${escapeHtml(tweet.user.name)}</h2>
                          <p>@${escapeHtml(tweet.user.screenName)}</p>
                      </div>
                  </div>
                  <div class="tweet-content">
                      <div class="tweet-text">${escapeHtml(tweet.fullText)}</div>
                      ${imageHtml}
                      ${videoHtml}
                  </div>
                  <div class="tweet-stats">
                      <span>❤️ ${tweet.favoriteCount || 0}</span>
                      <span>🔄 ${tweet.retweetCount || 0}</span>
                      <span>💬 ${tweet.replyCount || 0}</span>
                      <span>👁️ ${(tweet.user.followersCount || 0).toLocaleString()}</span>
                  </div>
                  <a href="${tweet.tweetUrl}" target="_blank" class="tweet-link">查看原文</a>
              </div>`;
  }

// 生成HTML内容
function generateHTML(tweetsData: CustomTweetData[], targetDate: string): string {
  const allTweetCards = tweetsData.map((tweet, index) => generateTweetCard(tweet, index)).join('');
  
  return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X-Kit 推文数据可视化 - ${targetDate}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
        }
        header {
            background-color: #1da1f2;
            color: white;
            text-align: center;
            padding: 1rem;
        }
        header h1 {
            margin: 0;
            font-size: 2rem;
        }
        header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
        }
        .stats-bar {
            background: white;
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-around;
            text-align: center;
        }
        .stat-item {
            flex: 1;
        }
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1da1f2;
            margin-bottom: 0.25rem;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        .tweet-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1rem;
        }
        .tweet-card {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 1rem;
            margin-bottom: 1rem;
            max-height: 650px; /* 限制卡片最大高度 */
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .tweet-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            flex-shrink: 0; /* 头部不压缩 */
        }
        .tweet-content {
            flex: 1;
            overflow-y: auto; /* 内容区域可滚动 */
            margin-bottom: 0.5rem;
            min-height: 0;
        }
        .tweet-text {
            margin-bottom: 0.5rem;
            line-height: 1.4;
            max-height: 200px; /* 文本最大高度 */
            overflow-y: auto; /* 文本可滚动 */
            padding-right: 8px; /* 为滚动条留空间 */
        }
        .tweet-image {
            max-width: 100%;
            max-height: 250px; /* 图片最大高度 */
            width: auto;
            height: auto;
            border-radius: 10px;
            margin-bottom: 0.5rem;
            object-fit: contain;
            cursor: pointer; /* 提示可点击查看大图 */
        }
        .tweet-video {
            max-width: 100%;
            max-height: 250px; /* 视频最大高度 */
            width: auto;
            height: auto;
            border-radius: 10px;
            margin-bottom: 0.5rem;
            object-fit: contain;
            cursor: pointer; /* 提示可点击查看大图 */
        }
        .tweet-stats {
            display: flex;
            justify-content: space-between;
            color: #657786;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            border-top: 1px solid #e1e8ed;
            padding-top: 0.5rem;
            flex-shrink: 0; /* 底部统计不压缩 */
        }
        .tweet-link {
            display: inline-block;
            color: #1da1f2;
            text-decoration: none;
            font-size: 0.9rem;
            flex-shrink: 0;
            margin-top: auto;
        }
        
        /* 自定义滚动条样式 */
        .tweet-text::-webkit-scrollbar,
        .tweet-content::-webkit-scrollbar {
            width: 4px;
        }
        .tweet-text::-webkit-scrollbar-track,
        .tweet-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 2px;
        }
        .tweet-text::-webkit-scrollbar-thumb,
        .tweet-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
        }
        .tweet-text::-webkit-scrollbar-thumb:hover,
        .tweet-content::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }
        .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 0.5rem;
        }
        .user-info h2 {
            margin: 0;
            font-size: 1rem;
        }
        .user-info p {
            margin: 0;
            color: #657786;
            font-size: 0.9rem;
        }
        .tweet-link:hover {
            text-decoration: underline;
        }
        .load-more {
            text-align: center;
            margin: 2rem 0;
        }
        .load-more button {
            background-color: #1da1f2;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .load-more button:hover {
            background-color: #0d8bd9;
        }
        .load-more button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        @media (max-width: 900px) {
            .tweet-container {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
            .stats-bar {
                flex-wrap: wrap;
            }
            .stat-item {
                min-width: 50%;
                margin-bottom: 0.5rem;
            }
        }
        @media (max-width: 600px) {
            .tweet-container {
                grid-template-columns: 1fr;
            }
            .stats-bar {
                flex-direction: column;
            }
            .stat-item {
                min-width: 100%;
                margin-bottom: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>🚀 X-Kit 推文数据可视化</h1>
        <p>📅 ${targetDate} | 实时推文数据分析与展示</p>
    </header>
    <main>
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-number">${tweetsData.length}</div>
                <div class="stat-label">推文总数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${new Set(tweetsData.map(tweet => tweet.user.screenName)).size}</div>
                <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${tweetsData.reduce((sum, tweet) => sum + (tweet.images?.length || 0), 0)}</div>
                <div class="stat-label">图片数量</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${tweetsData.reduce((sum, tweet) => sum + (tweet.videos?.length || 0), 0)}</div>
                <div class="stat-label">视频数量</div>
            </div>
        </div>
        
        <div class="tweet-container" id="tweetContainer">
            ${allTweetCards}
        </div>
        
        ${tweetsData.length > 20 ? '<div class="load-more"><button id="loadMoreBtn">加载更多推文</button></div>' : ''}
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            let currentlyVisible = 20;
            const itemsPerLoad = 20;
            const totalItems = ${tweetsData.length};
            
            function loadMoreTweets() {
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                const allCards = document.querySelectorAll('.tweet-card');
                
                loadMoreBtn.disabled = true;
                loadMoreBtn.textContent = '加载中...';
                
                const endIndex = Math.min(currentlyVisible + itemsPerLoad, totalItems);
                
                for (let i = currentlyVisible; i < endIndex; i++) {
                    if (allCards[i]) {
                        allCards[i].style.display = 'block';
                    }
                }
                
                currentlyVisible = endIndex;
                
                if (currentlyVisible >= totalItems) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.textContent = '加载更多推文';
                }
            }

            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreTweets);
            }
            
            // 图片放大功能
            window.openImageModal = function(imageSrc) {
                const modal = document.createElement('div');
                modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer;';
                
                const img = document.createElement('img');
                img.src = imageSrc;
                img.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 10px;';
                
                modal.appendChild(img);
                document.body.appendChild(modal);
                
                modal.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            };
            
            // 键盘支持
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    const modal = document.querySelector('div[style*="position: fixed"]');
                    if (modal) {
                        document.body.removeChild(modal);
                    }
                }
            });
        });
    </script>
</body>
</html>`;
}

// 更新index.html
function updateIndexHtml(targetDate: string): void {
  const visualDir = "./visual";
  const indexPath = `${visualDir}/index.html`;
  
  if (!fs.existsSync(indexPath)) {
    const indexContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>X-Kit 数据可视化中心</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
        }
        h1 {
            color: #1da1f2;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        p {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .daily-links {
            display: grid;
            gap: 15px;
        }
        .day-link {
            background-color: #1da1f2;
            color: #fff;
            text-decoration: none;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            transition: background-color 0.3s ease;
            display: block;
        }
        .day-link:hover {
            background-color: #0d8bd9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 X-Kit 数据可视化</h1>
        <p>选择日期查看推文数据分析</p>
        <div class="daily-links" id="links-container">
            <a href="tweets-${targetDate}.html" class="day-link">📅 ${targetDate} - 推文分析</a>
        </div>
    </div>
</body>
</html>`;
    fs.writeFileSync(indexPath, indexContent);
    console.log(`🏠 已创建首页: ${indexPath}`);
  } else {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    if (!indexContent.includes(`href="tweets-${targetDate}.html"`)) {
      const newLinkHtml = `            <a href="tweets-${targetDate}.html" class="day-link">📅 ${targetDate} - 推文分析</a>\n`;
      const insertPoint = indexContent.indexOf('</div>\n    </div>');
      if (insertPoint !== -1) {
        indexContent = indexContent.slice(0, insertPoint) + newLinkHtml + indexContent.slice(insertPoint);
        fs.writeFileSync(indexPath, indexContent);
        console.log(`🏠 已更新首页链接: ${indexPath}`);
      }
    }
  }
}

// 主要执行逻辑
async function main() {
  try {
    // --- 数据获取和处理逻辑 ---
    console.log("🚀 开始获取推文数据...");
    const client = await XAuthClient();
    const resp = await client.getTweetApi().getHomeLatestTimeline({ count: 100 });
    const originalTweets = resp.data.data.filter((tweet) => {
      const tweetAny = tweet as any;
      return !tweetAny.referenced_tweets || tweetAny.referenced_tweets.length === 0;
    });

    const rows: CustomTweetData[] = [];
    originalTweets.forEach((tweet) => {
      const tweetAny = tweet as any;
      const isQuoteStatus = get(tweetAny, "raw.result.legacy.isQuoteStatus");
      if (isQuoteStatus) return;
      const fullText = get(tweetAny, "raw.result.legacy.fullText", "RT @");
      if (fullText?.includes("RT @")) return;
      const createdAt = get(tweetAny, "raw.result.legacy.createdAt");
      if (dayjs().diff(dayjs(createdAt), "day") > 1) return;
      const screenName = get(tweetAny, "user.legacy.screenName");
      const tweetUrl = `https://x.com/${screenName}/status/${get(tweetAny, "raw.result.legacy.idStr")}`;
      const user = {
        screenName: get(tweetAny, "user.legacy.screenName"),
        name: get(tweetAny, "user.legacy.name"),
        profileImageUrl: get(tweetAny, "user.legacy.profileImageUrlHttps"),
        description: get(tweetAny, "user.legacy.description"),
        followersCount: get(tweetAny, "user.legacy.followersCount"),
        friendsCount: get(tweetAny, "user.legacy.friendsCount"),
        location: get(tweetAny, "user.legacy.location"),
      };
      const mediaItems = get(tweetAny, "raw.result.legacy.extendedEntities.media", []);
      const images = mediaItems
        .filter((media: any) => media.type === "photo")
        .map((media: any) => media.mediaUrlHttps);
      const videos = mediaItems
        .filter((media: any) => media.type === "video" || media.type === "animated_gif")
        .map((media: any) => {
          const variants = get(media, "videoInfo.variants", []);
          const bestQuality = variants
            .filter((v: any) => v.contentType === "video/mp4")
            .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
          return bestQuality?.url;
        })
        .filter(Boolean);
      const favoriteCount = get(tweetAny, "raw.result.legacy.favoriteCount", 0);
      const retweetCount = get(tweetAny, "raw.result.legacy.retweetCount", 0);
      const replyCount = get(tweetAny, "raw.result.legacy.replyCount", 0);
      rows.push({ 
        user, 
        images, 
        videos, 
        tweetUrl, 
        fullText, 
        createdAt, 
        favoriteCount, 
        retweetCount, 
        replyCount, 
        hashtags: get(tweetAny, "raw.result.legacy.entities.hashtags", []), 
        mentions: get(tweetAny, "raw.result.legacy.entities.userMentions", []) 
      });
    });

    const today = dayjs().format("YYYY-MM-DD");
    const outputPath = `./tweets/${today}.json`;
    let existingRows: CustomTweetData[] = [];
    if (fs.existsSync(outputPath)) {
      existingRows = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    }

    const allRows = [...existingRows, ...rows];
    const uniqueRows = Array.from(new Map(allRows.map(row => [row.tweetUrl, row])).values());
    const sortedRows = uniqueRows.sort((a, b) => {
      const idA = a.tweetUrl.split('/').pop() || '';
      const idB = b.tweetUrl.split('/').pop() || '';
      return idB.localeCompare(idA);
    });

    fs.writeFileSync(outputPath, JSON.stringify(sortedRows, null, 2));
    console.log(`✅ 已保存 ${rows.length} 条新推文到: ${outputPath}`);
    console.log(`📊 总共有 ${sortedRows.length} 条不重复的推文`);

    // --- 生成网页逻辑 ---
    console.log("🎨 开始生成可视化页面...");
    
    // 创建输出目录
    const visualDir = "./visual";
    if (!fs.existsSync(visualDir)) {
      fs.mkdirSync(visualDir, { recursive: true });
    }

    // 生成HTML内容
    const htmlContent = generateHTML(sortedRows, today);

    // 保存HTML文件
    const htmlPath = `${visualDir}/tweets-${today}.html`;
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`🎨 已生成可视化页面: ${htmlPath}`);

    // 创建或更新index.html
    updateIndexHtml(today);

    console.log("🎉 获取数据和生成网页完成！");
  } catch (error) {
    console.error("❌ 执行过程中出现错误:", error);
    process.exit(1);
  }
}

// 执行主函数
main();
