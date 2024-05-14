const defaultSaveData = {
  isUseOnlySpace: true,
  customKeyPattern: '',
  shiftKey: true,
  ctrlKey: true,
};

const STATE = {
  saveData: defaultSaveData,
};

const getMessage = (key: string) => chrome.i18n.getMessage(key) || key;
const isValidOptionType = (value: unknown): value is keyof SaveDataType => {
  if (typeof value !== 'string') {
    return false;
  }

  return value in defaultSaveData;
};

const checkboxes = document.querySelectorAll<HTMLInputElement>('[type="checkbox"]');
const editCustomKeyField = document.getElementById('field')!;
const save = (newSaveData: SaveDataType) => {
  const value = {
    ...STATE.saveData,
    ...newSaveData,
  };

  STATE.saveData = value;

  for (const checkbox of checkboxes) {
    if (isValidOptionType(checkbox.dataset.optionType)) {
      const currentValue = value[checkbox.dataset.optionType];

      if (typeof currentValue === 'string') {
        checkbox.value = currentValue;
      } else {
        checkbox.checked = currentValue ?? false;
      }
    }
  }

  chrome.storage.local.set({
    saveData: value,
  });

  return value;
};

const setLanguage = () => {
  const targets = document.querySelectorAll<HTMLElement>('[data-i18n]');

  for (const elm of targets) {
    const { i18n } = elm.dataset;

    if (!i18n) {
      continue;
    }

    const textContent = getMessage(i18n);

    if (elm.tagName.toLocaleLowerCase() === 'h1') {
      elm.textContent = textContent.split('※').slice(0, 1).join(''); // JPタイトルに注釈テキストを表示しない
    } else {
      elm.textContent = textContent;
    }
  }
};

const loadSaveData = async () => {
  const getValue = <T>(key: string, callback: (items: Record<string, T | undefined>) => void) =>
    new Promise<void>((resolve) => {
      chrome.storage.local.get(key, (items) => {
        callback(items);
        resolve();
      });
    });

  return Promise.all([
    getValue<typeof defaultSaveData>('saveData', ({ saveData }) => {
      for (const [key, value] of Object.entries<boolean | string>(saveData ?? defaultSaveData)) {
        const checkbox = document.querySelector<HTMLInputElement>(`[data-option-type=${key}]`);

        console.log(key);

        if (typeof value === 'boolean' && checkbox) {
          checkbox.checked = value;
        }
      }

      STATE.saveData = saveData ?? defaultSaveData;
    }),
  ]);
};

const writeCustomKey = (state: SaveDataType) => {
  const key = state.customKeyPattern === ' ' ? '[Space]' : state.customKeyPattern;
  const keyes = [
    key,
    state.shiftKey ? '[Shift]' : '',
    state.ctrlKey ? '[Ctrl / Command]' : '',
  ].filter(Boolean);

  editCustomKeyField.textContent = keyes.join(' + ');
};
const addEvent = () => {
  for (const checkbox of checkboxes) {
    checkbox.addEventListener('change', () => {
      if (isValidOptionType(checkbox.dataset.optionType)) {
        const result = save({
          [checkbox.dataset.optionType]: checkbox.checked,
        });

        writeCustomKey(result);
      }
    });
  }

  let isEditing = false;
  const editCustomKeyOnClick = () => {
    isEditing = true;
    editCustomKeyField.textContent = chrome.i18n.getMessage('editing');
  };

  editCustomKeyField.addEventListener('blur', () => {
    isEditing = false;
    writeCustomKey(STATE.saveData);
  });
  editCustomKeyField.addEventListener('keypress', (e) => {
    if (isEditing) {
      e.stopPropagation();
      e.preventDefault();
      isEditing = false;

      const state = save({
        customKeyPattern: e.key,
      });
      writeCustomKey(state);

      return;
    }

    if (e.key === 'Enter' && e.currentTarget instanceof HTMLElement) {
      e.preventDefault();
      e.currentTarget.click();
    }
  });
  editCustomKeyField?.addEventListener('click', editCustomKeyOnClick);
};

setLanguage();
loadSaveData().then(() => {
  writeCustomKey(STATE.saveData);
  addEvent();
});

// CSS Transitionの有効化
setTimeout(() => {
  document.body.dataset.state = 'loaded';
}, 300);
