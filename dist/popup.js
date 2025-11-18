// 预设颜色配置
const presetColors = [
  { color: '#D01060', name: 'Crimson' },
  { color: '#FF4500', name: 'Orange' },
  { color: '#008000', name: 'Green' },
  { color: '#4B0082', name: 'Indigo' },
  { color: '#FF1493', name: 'Pink' }
];

// 固定的饱和度和亮度（确保颜色适合作为链接色）
const FIXED_SATURATION = 75;
const FIXED_LIGHTNESS = 45;

// 状态变量
let currentColor = '#D01060';
let originalColor = '#D01060';
let colorHistory = [];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 加载保存的数据
  const data = await chrome.storage.sync.get(['visitedLinkColor', 'colorHistory']);
  currentColor = data.visitedLinkColor || '#D01060';
  originalColor = currentColor;
  colorHistory = data.colorHistory || [];

  // 创建UI
  createPresetOptions();
  renderRecentColors();
  updateColorDisplay(currentColor);
  syncSelectedState(currentColor);

  // 绑定事件
  document.getElementById('hue-slider').addEventListener('input', onHueSliderChange);
  document.getElementById('custom-color').addEventListener('input', onCustomColorChange);
  document.getElementById('save').addEventListener('click', saveColor);
  document.getElementById('cancel').addEventListener('click', cancelChanges);
  document.getElementById('advanced-toggle').addEventListener('click', toggleAdvancedPicker);
});

// HSL 转 HEX
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// HEX 转 HSL
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// 创建预设颜色选项
function createPresetOptions() {
  const container = document.getElementById('color-options');
  presetColors.forEach(({ color, name }) => {
    const div = document.createElement('div');
    div.className = 'color-option';
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.dataset.name = name;
    div.addEventListener('click', () => selectColor(color));
    container.appendChild(div);
  });
}

// 渲染最近使用的颜色
function renderRecentColors() {
  const container = document.getElementById('recent-colors');
  const section = document.getElementById('recent-section');

  // 过滤掉预设颜色
  const presetColorValues = presetColors.map(p => p.color.toUpperCase());
  const filteredHistory = colorHistory.filter(c => !presetColorValues.includes(c.toUpperCase()));

  if (filteredHistory.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  filteredHistory.forEach(color => {
    const div = document.createElement('div');
    div.className = 'recent-color';
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.addEventListener('click', () => selectColor(color));
    container.appendChild(div);
  });
}

// 选择颜色（预设或历史）
function selectColor(color) {
  currentColor = color;
  updateColorDisplay(color);
  syncSelectedState(color);
  previewColor(color);
}

// 色相滑块变化
function onHueSliderChange(event) {
  const hue = parseInt(event.target.value);
  const color = hslToHex(hue, FIXED_SATURATION, FIXED_LIGHTNESS);
  currentColor = color;
  updateColorDisplay(color);
  clearAllSelected();
  previewColor(color);
}

// 高级颜色选择器变化
function onCustomColorChange(event) {
  const color = event.target.value;
  currentColor = color;
  updateColorDisplay(color);
  clearAllSelected();
  previewColor(color);
}

// 切换高级选择器显示
function toggleAdvancedPicker() {
  const picker = document.getElementById('advanced-picker');
  const toggle = document.getElementById('advanced-toggle');

  if (picker.style.display === 'none' || !picker.style.display) {
    picker.style.display = 'block';
    toggle.textContent = 'Hide advanced';
  } else {
    picker.style.display = 'none';
    toggle.textContent = 'Advanced picker';
  }
}

// 更新颜色显示
function updateColorDisplay(color) {
  // 更新高级选择器
  document.getElementById('custom-color').value = color;

  // 更新HEX显示
  document.getElementById('color-value').textContent = color.toUpperCase();

  // 更新预览圆形
  document.getElementById('color-preview').style.backgroundColor = color;

  // 更新滑块位置（根据颜色的色相值）
  const hsl = hexToHsl(color);
  document.getElementById('hue-slider').value = hsl.h;
}

// 同步选中状态
function syncSelectedState(color) {
  clearAllSelected();

  // 检查预设颜色
  const presetOption = document.querySelector(`.color-option[data-color="${color}"]`);
  if (presetOption) {
    presetOption.classList.add('selected');
    return;
  }

  // 检查最近使用
  const recentOption = document.querySelector(`.recent-color[data-color="${color}"]`);
  if (recentOption) {
    recentOption.classList.add('selected');
  }
}

// 清除所有选中状态
function clearAllSelected() {
  document.querySelectorAll('.color-option, .recent-color').forEach(el => {
    el.classList.remove('selected');
  });
}

// 预览颜色（发送到content script但不保存）
function previewColor(color) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'previewColor',
        color: color
      }).catch(() => {
        // 忽略无法发送消息的错误（如chrome://页面）
      });
    }
  });
}

// 保存颜色
async function saveColor() {
  // 添加到历史记录
  addToHistory(currentColor);

  // 保存到存储
  await chrome.storage.sync.set({
    visitedLinkColor: currentColor,
    colorHistory: colorHistory
  });

  // 通知content script保存
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'saveColor',
        color: currentColor
      }).catch(() => {});
    }
  });

  originalColor = currentColor;
  showMessage('Color saved!', false);
  renderRecentColors();
  syncSelectedState(currentColor);
}

// 取消更改
function cancelChanges() {
  currentColor = originalColor;
  updateColorDisplay(originalColor);
  syncSelectedState(originalColor);
  previewColor(originalColor);
}

// 添加颜色到历史记录
function addToHistory(color) {
  const upperColor = color.toUpperCase();

  // 移除已存在的相同颜色
  colorHistory = colorHistory.filter(c => c.toUpperCase() !== upperColor);

  // 添加到开头
  colorHistory.unshift(upperColor);

  // 保持最多5个
  if (colorHistory.length > 5) {
    colorHistory = colorHistory.slice(0, 5);
  }
}

// 显示消息
function showMessage(text, isError = false) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = text;
  messageElement.className = 'message' + (isError ? ' error' : '');
  messageElement.style.display = 'block';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 2000);
}
