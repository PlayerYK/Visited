// 样式元素ID
const STYLE_ID = 'visited-link-color-style';

// 应用visited链接样式
function applyVisitedStyle(color) {
  // 移除已存在的样式
  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }

  // 创建新样式
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    a:visited {
      color: ${color} !important;
    }
  `;
  document.head.appendChild(style);
}

// 初始化：从存储加载颜色
chrome.storage.sync.get('visitedLinkColor', (data) => {
  const color = data.visitedLinkColor || '#D01060';
  applyVisitedStyle(color);
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'previewColor' || request.action === 'saveColor') {
    applyVisitedStyle(request.color);
  }
  // 兼容旧版本的action
  if (request.action === 'updateColor') {
    applyVisitedStyle(request.color);
  }
});
