type Status = {
  /** ドラッグスクロールが利用可能かどうか */
  disabled: boolean,
  /** スクロール対象ノード、あるいはwindow */
  target: HTMLElement | Window | null,
  /** Y軸方向ドラッグ開始位置 */
  x: number,
  /** X軸方向ドラッグ開始位置 */
  y: number,
  /** X軸方向スクロール開始位置 */
  startX: number,
  /** Y軸方向スクロール開始位置 */
  startY: number,
  /** スペースキーが押されているか */
  pressSpace: boolean,
  /** マウスボタンが押されているか */
  pressMouse: boolean,
};

/** 全体の状態管理 */
const STATUS: Status = {
  disabled: false,
  target: window,
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  pressSpace: false,
  pressMouse: false,
};
/**
 * ドラッグ時のイベントハンドラ
 * @param e - マウスイベント
 */
const listener = (e: MouseEvent) => {
  const left = STATUS.startX + STATUS.x - e.screenX;
  const top = STATUS.startY + STATUS.y - e.screenY;

  STATUS.target?.scroll({
    top,
    left,
  });
};
const options: AddEventListenerOptions = {
  passive: true,
};
/** 手のひらツール利用時にカーソルを変化させるためのスタイルを実現するためのstyle要素 */
const style = (() => {
  const elm = document.createElement('style');

  elm.dataset.from = 'chrome-extenstion';
  elm.textContent = '* {cursor: move !important;}';

  return elm;
})();
/** ドラッグ終了時にクリックイベントやmouseupイベントが既存の要素で発火するのを防ぐための要素 */
const dragScreen = (() => {
  const elm = document.createElement('drag-screen');

  elm.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2147483647;
  `;
  // background: rgba(255, 0, 0, .5);
  elm.dataset.from = 'chrome-extenstion';

  return elm;
})();
/** 初期化 */
const init = () => {
  STATUS.pressSpace = false;
  STATUS.pressMouse = false;
  style.remove();
  window.removeEventListener('mousemove', listener, options);
};

// -----------------------------------------------------------------------------
// 有効かどうかの判断（拡張アイコン押下で有効無効の切り替えを行う）
// -----------------------------------------------------------------------------
chrome.storage.local.get(['disabled'], ({disabled}) => {
  STATUS.disabled = Boolean(disabled);
});
chrome.runtime.onMessage.addListener(({data}) => {
  STATUS.disabled = data.disabled;
});


// -----------------------------------------------------------------------------
// スペースキーの入力周り
// -----------------------------------------------------------------------------
window.addEventListener('keydown', (e) => {
  if (
    STATUS.disabled ||
    (
      // activeElementでスペースキーが特別な役割を持つ要素の場合
      e.target === document.activeElement &&
      (
        (document.activeElement as HTMLElement).contentEditable === 'true' ||
        ['input', 'textarea', 'button'].some((name) => {
          return name === document.activeElement?.tagName.toLowerCase();
        })
      )
    )
  ) {
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();

    if (STATUS.pressSpace) {
      return;
    }

    STATUS.pressSpace = true;
    document.head.append(style);
  }
});
window.addEventListener('keyup', (e) => {
  if (
    e.key === ' ' &&
    STATUS.pressSpace
  ) {
    STATUS.pressSpace = false;

    // スペースキーが離されたとき、ドラッグが続いていれば初期化はmouseupに任せる
    if (!STATUS.pressMouse) {
      init();
    }
  }
});


// -----------------------------------------------------------------------------
// マウス操作周り
// -----------------------------------------------------------------------------
window.addEventListener('mousedown', (e) => {
  if (STATUS.disabled) {
    return;
  }

  if (STATUS.pressSpace) {
    let target = e.target as HTMLElement | null;

    e.preventDefault();

    STATUS.target = null;
    STATUS.pressMouse = true;

    // スクロール対象の検出
    while (target) {
      if (
        // 子ノードがあり、
        target.firstChild &&
        (
          // スクロール可能で、
          (
            target.clientWidth !== target.scrollWidth &&
            3 < Math.abs(target.clientWidth - target.scrollWidth)
          ) ||
          (
            target.clientHeight !== target.scrollHeight &&
            3 < Math.abs(target.clientHeight - target.scrollHeight)
          )
        ) &&
        // oveflow: visibleではないとき
        'visible' !== getComputedStyle(target as HTMLElement).overflow
      ) {
        STATUS.target = target || window;

        break;
      }

      target = target.parentElement;
    }

    STATUS.target ||= window;
    STATUS.x = e.screenX;
    STATUS.y = e.screenY;

    if (STATUS.target === window) {
      STATUS.startX = window.pageXOffset;
      STATUS.startY = window.pageYOffset;
    } else {
      STATUS.startX = (STATUS.target as HTMLElement).scrollLeft;
      STATUS.startY = (STATUS.target as HTMLElement).scrollTop;
    }

    document.body.append(dragScreen);
    window.addEventListener('mousemove', listener, options);
  }
});
window.addEventListener('mouseup', () => {
  STATUS.pressMouse = false;

  // マウスボタンが離されたとき、スペースキーが押されていれば初期化はkeyupに任せる
  if (!STATUS.pressSpace) {
    init();
  }

  dragScreen.remove();
  window.removeEventListener('mousemove', listener, options);
});


// -----------------------------------------------------------------------------
// 中断
// -----------------------------------------------------------------------------
window.addEventListener('blur', () => init());
