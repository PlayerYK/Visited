function applyVisitedStyle(color) {
  const style = document.createElement('style');
  style.textContent = `
    a:visited {
      color: ${color} !important;
    }
  `;
  document.head.appendChild(style);
}

chrome.storage.sync.get('visitedLinkColor', (data) => {
  const color = data.visitedLinkColor || '#D01060';
  applyVisitedStyle(color);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateColor") {
    applyVisitedStyle(request.color);
  }
});