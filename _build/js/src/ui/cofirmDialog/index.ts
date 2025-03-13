import { button } from '../dom/button';
import { createElement } from '../utils';

import type { Button } from '../dom/button';

type ConfirmDialogOptions = {
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText: string;
};

export const confirmDialog = (config: ConfirmDialogOptions) => {
  const cancelBtn = button(
    'Cancel',
    () => {
      closeDialog();
    },
    'cancelBtn',
    { tabIndex: 0 },
  );
  const confirmBtn = button(
    config.confirmText,
    () => {
      destroyDialog();
      config.onConfirm();
    },
    'confirmBtn',
    { tabIndex: 0 },
  );

  const overlay = createElement(
    'div',
    'modai--root overlay',
    [
      createElement(
        'div',
        'dialog',
        [
          createElement('h3', 'title', config.title),
          createElement('p', 'message', config.content),
          createElement('div', 'buttons', [cancelBtn, confirmBtn]),
        ],
        { tabIndex: -1 },
      ),
    ],
    {
      ariaModal: 'true',
      role: 'dialog',
      ariaLabel: config.title,
    },
  );

  const destroyDialog = () => {
    document.removeEventListener('keydown', handleDialogKeyDown);
    overlay.remove();
  };

  const closeDialog = () => {
    destroyDialog();
    config.onCancel?.();
  };

  const handleDialogKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();
      closeDialog();
    }

    if (e.key === 'Tab') {
      const focusableElements = [cancelBtn, confirmBtn];
      const focusedElement = document.activeElement;
      const currentIndex = focusedElement ? focusableElements.indexOf(focusedElement as Button) : 0;

      if (e.shiftKey) {
        if (currentIndex === 0 || currentIndex === -1) {
          confirmBtn.focus();
        } else {
          cancelBtn.focus();
        }
      } else {
        if (currentIndex === 1 || currentIndex === -1) {
          cancelBtn.focus();
        } else {
          confirmBtn.focus();
        }
      }

      e.preventDefault();
    }
  };

  document.addEventListener('keydown', handleDialogKeyDown);

  document.body.append(overlay);

  confirmBtn.focus();
};
