type StorageItem = { isUseOnlySpace?: boolean | undefined };
const resolveIsActive = ({ isUseOnlySpace }: StorageItem) => {
  if (typeof isUseOnlySpace === 'boolean') {
    return isUseOnlySpace;
  }

  return true;
};

const setIconPath = (isUseOnlySpace: boolean) => {
  const path = isUseOnlySpace ? 'icon.png' : 'icon--disabled.png';

  chrome.storage.local.set({ isUseOnlySpace });
  chrome.action.setIcon({ path });
};

const toggleIconPath = () => {
  return new Promise<boolean>((resolve) => {
    chrome.storage.local.get(['isUseOnlySpace'], (value: StorageItem) => {
      const isUseOnlySpace = !resolveIsActive(value);

      setIconPath(isUseOnlySpace);
      resolve(isUseOnlySpace);
    });
  });
};

chrome.storage.local.get(['isUseOnlySpace'], (value: StorageItem) => {
  const isUseOnlySpace = resolveIsActive(value);

  setIconPath(isUseOnlySpace);
});

chrome.action.onClicked.addListener(() => {
  new Promise(async () => {
    const isUseOnlySpace = await toggleIconPath();
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    if (tab.url?.startsWith('http') && typeof tab.id === 'number') {
      chrome.tabs.sendMessage(tab.id, { isUseOnlySpace }).catch(console.log);
    }
  });

  return true;
});
