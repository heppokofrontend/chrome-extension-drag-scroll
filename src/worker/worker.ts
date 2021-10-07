/**
 * アイコンの切り替え
 * @param isDisabled - 無効化アイコンにするかどうか
 */
const changeIcon = (isDisabled: boolean) => {
  if (isDisabled) {
    chrome.action.setIcon({
      path: 'icon--disabled.png',
    });
  } else {
    chrome.action.setIcon({
      path: 'icon.png',
    });
  }
};

// ストレージからステータスを読み取る
chrome.storage.local.get(['disabled'], ({disabled}) => {
  changeIcon(disabled);
});

// popupから受け取ったらステータスをcontent.jsに連絡する準備
chrome.runtime.onMessage.addListener(async ({data}) => {
  const tabs = await chrome.tabs.query({});

  changeIcon(data.disabled);

  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id!, { // to contents
      data,
    });
  }
});
