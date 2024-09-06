const defaultColors = ['#D01060', '#FF4500', '#008000', '#4B0082', '#FF1493'];

function createColorOptions() {
  const container = document.getElementById('color-options');
  defaultColors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-option';
    div.style.backgroundColor = color;
    div.addEventListener('click', (event) => selectColor(color, event));
    container.appendChild(div);
  });
}

function selectColor(color, event) {
  document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
  event.target.classList.add('selected');
  document.getElementById('custom-color').value = color;
}

function showMessage(text, color) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = text;
  messageElement.style.display = 'block';
  messageElement.style.color = color;
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}

function saveColor() {
  const color = document.getElementById('custom-color').value;
  chrome.storage.sync.set({visitedLinkColor: color}, () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "updateColor", color: color});
      
      // 显示保存成功的提醒，使用用户选择的颜色
      showMessage('Color saved! Please refresh to see the changes.', color);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createColorOptions();
  chrome.storage.sync.get('visitedLinkColor', (data) => {
    const savedColor = data.visitedLinkColor || '#D01060';
    document.getElementById('custom-color').value = savedColor;
  });
  document.getElementById('save').addEventListener('click', saveColor);
});