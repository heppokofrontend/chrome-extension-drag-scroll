// アイコンクリックで有効無効を切り替えます
chrome.storage.local.get(['disabled'], ({disabled}) => {
  const data = {
    disabled: !disabled,
  };

  chrome.storage.local.set(data);
  chrome.runtime.sendMessage({ // to worker
    data,
  });

  window.close();
});
