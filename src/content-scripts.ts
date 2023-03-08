const state: {
  isUseOnlySpace: Boolean;
  target: EventTarget | null;
  x: number;
  y: number;
  startX: number;
  startY: number;
  scrollableX: Boolean;
  scrollableY: Boolean;
  pressSpace: Boolean;
  pressMouse: Boolean;
} = {
  /** Spaceキーのみか、またはCtrl+Shift+Spaceか */
  isUseOnlySpace: false,
  /** スクロール対象ノード、あるいはwindow */
  target: window,
  /** Y軸方向ドラッグ開始位置 */
  x: 0,
  /** X軸方向ドラッグ開始位置 */
  y: 0,
  /** X軸方向スクロール開始位置 */
  startX: 0,
  /** Y軸方向スクロール開始位置 */
  startY: 0,
  /** X軸方向スクロール可能 */
  scrollableX: false,
  /** Y軸方向スクロール可能 */
  scrollableY: false,
  /** スペースキーが押されているか */
  pressSpace: false,
  /** マウスボタンが押されているか */
  pressMouse: false,
};
const run = () => {
  /** 手のひらツール利用時にカーソルを変化させるためのスタイルを実現するためのstyle要素 */
  const styleElement = (() => {
    const element = document.createElement('style');

    element.textContent = '* {cursor: move !important;}';
    element.dataset.from = 'chrome-extenstion';

    return element;
  })();
  /** ドラッグ終了時にクリックイベントやmouseupイベントが既存の要素で発火するのを防ぐための要素 */
  const dragScreen = (() => {
    const element = document.createElement('drag-screen');

    element.style.cssText = `
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
    `;
    // background: rgba(0,0,0,0.2)
    element.dataset.from = 'chrome-extenstion';

    return element;
  })();

  const mousemoveHandler = (e: MouseEvent) => {
    const { startX, scrollableX, x, startY, scrollableY, y } = state;
    const left = startX + (scrollableX ? x - e.screenX : 0);
    const top = startY + (scrollableY ? y - e.screenY : 0);

    if (state.target instanceof Window || state.target instanceof Element) {
      state.target?.scroll({
        top,
        left,
      });
    }
  };

  const mouseupHandler = () => {
    state.pressMouse = false;
    dragScreen.remove();
    window.removeEventListener('mousemove', mousemoveHandler);
  };

  const visibleOrHidden = /visible|hidden/;
  const diff = 3;
  const isScrollableHorizon = ({
    target,
    overflowX,
  }: {
    target: HTMLElement;
    overflowX: string;
  }) => {
    return (
      target.clientWidth !== target.scrollWidth &&
      diff < Math.abs(target.clientWidth - target.scrollWidth) &&
      !visibleOrHidden.test(overflowX)
    );
  };
  const isScrollableVertical = ({
    target,
    overflowY,
  }: {
    target: HTMLElement;
    overflowY: string;
  }) => {
    return (
      target.clientHeight !== target.scrollHeight &&
      diff < Math.abs(target.clientHeight - target.scrollHeight) &&
      !visibleOrHidden.test(overflowY)
    );
  };

  const resolveTarget = (
    eventTarget: EventTarget | null,
  ): {
    target: EventTarget;
    scrollableX: boolean;
    scrollableY: boolean;
  } => {
    if (eventTarget instanceof HTMLElement) {
      let target: Window | HTMLElement = eventTarget;
      let scrollableX = false;
      let scrollableY = false;
      const checkedNodes = [];

      while (target) {
        checkedNodes.push(target);

        if (10000 < checkedNodes.length) {
          console.error('chrome-extension-hand-tool', checkedNodes);
          break;
        }

        const { overflowX, overflowY } = getComputedStyle(target);

        // 空要素などのスクロールの余地がないノードを無視するための
        // 子要素を確認する。
        // なお、textarea要素はスペースキーが使えない
        if (target.firstChild) {
          scrollableX = isScrollableHorizon({ target, overflowX });
          scrollableY = isScrollableVertical({ target, overflowY });

          if (scrollableX || scrollableY) {
            return { target, scrollableX, scrollableY };
          }
        }

        if (!target.parentElement) {
          break;
        }

        target = target.parentElement;
      }
    }

    return {
      target: window,
      scrollableX: true,
      scrollableY: true,
    };
  };

  const mousedownHandler = (e: MouseEvent) => {
    if (!state.pressSpace) {
      return;
    }

    if (state.pressSpace) {
      const { target, scrollableX, scrollableY } = resolveTarget(e.target);

      e.preventDefault();
      state.target = target;
      state.x = e.screenX;
      state.y = e.screenY;
      state.scrollableX = scrollableX;
      state.scrollableY = scrollableY;
      state.pressMouse = true;

      if (target === window) {
        state.startX = window.pageXOffset;
        state.startY = window.pageYOffset;
      } else if (target instanceof HTMLElement) {
        state.startX = target.scrollLeft;
        state.startY = target.scrollTop;
      }

      document.body.append(dragScreen);
      window.addEventListener('mousemove', mousemoveHandler, {
        passive: true,
      });
    }
  };

  const targetIsEditableElement = (target: EventTarget | null) => {
    const { activeElement } = document;

    if (activeElement === null || target !== activeElement) {
      return false;
    }

    const isEditableElement =
      activeElement instanceof HTMLElement &&
      !['inherit', 'false'].includes(activeElement.contentEditable);
    const isFormControls = ['input', 'textarea', 'button'].includes(
      activeElement.tagName.toLowerCase(),
    );

    return isEditableElement || isFormControls;
  };

  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key !== ' ' || (!state.isUseOnlySpace && (!e.ctrlKey || !e.shiftKey))) {
      return;
    }

    if (state.pressSpace) {
      e.preventDefault();
      return;
    }

    if (targetIsEditableElement(e.target)) {
      return;
    }

    e.preventDefault();
    state.pressSpace = true;
    document.head.append(styleElement);
    document.body.append(dragScreen);
    window.addEventListener('mousedown', mousedownHandler);
  };

  const resetState = () => {
    state.pressSpace = false;
    state.pressMouse = false;
    dragScreen.remove();
    styleElement.remove();
    window.removeEventListener('mousedown', mousedownHandler);
    window.removeEventListener('mousemove', mousemoveHandler);
  };

  const keyupHandler = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      state.pressSpace = false;

      // スペースキーが離されたとき、ドラッグが続いていれば初期化はmouseupに任せる
      if (!state.pressMouse) {
        resetState();

        return;
      }
    }

    dragScreen.remove();
    styleElement.remove();
    window.removeEventListener('mousedown', mousedownHandler);
  };

  dragScreen.addEventListener('mouseup', (e) => {
    // body要素のイベントが発火するのを防ぐ
    e.stopPropagation();
    mouseupHandler();
  });

  window.addEventListener('mouseup', mouseupHandler);
  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);
  window.addEventListener('blur', resetState);
};

window.addEventListener('focus', () => {
  chrome.storage.local.get(['isUseOnlySpace'], ({ isUseOnlySpace }: StorageItem) => {
    state.isUseOnlySpace = Boolean(isUseOnlySpace);
  });
});

chrome.runtime.onMessage.addListener(({ isUseOnlySpace }: StorageItem) => {
  state.isUseOnlySpace = Boolean(isUseOnlySpace);
});

chrome.storage.local.get(['isUseOnlySpace'], ({ isUseOnlySpace }: StorageItem) => {
  state.isUseOnlySpace = Boolean(isUseOnlySpace);
  run();
});
