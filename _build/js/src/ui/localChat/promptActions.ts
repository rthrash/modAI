import { create } from '@stylexjs/stylex';

import { createElement } from '../utils';
import { sendMessage, stopGeneration, tryAgain } from './modalActions';
import { button } from '../dom/button';

import type { Modal, ModalConfig } from './types';

const styles = create({
  buttonsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100px',
  },
  actionButtonsRow: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'space-between',
  },

  iconButton: {
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    width: '48px',
    height: '32px',
    padding: '0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    opacity: '1',
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  sendButton: {
    backgroundColor: '#6CB24A',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    height: '40px',
    minWidth: '100px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    opacity: '1',
    transition: 'background-color 0.2s ease',
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },

  sendIcon: {
    width: '16px',
    height: '16px',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z'/%3E%3C/svg%3E\")",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  stopIcon: {
    width: '16px',
    height: '16px',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23DC2626'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M6 6h12v12H6z'/%3E%3C/svg%3E\")",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  refreshIcon: {
    width: '16px',
    height: '16px',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234B5563'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E\")",
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
});

export const buildPromptActions = (modal: Modal, config: ModalConfig) => {
  const sendBtn = button(
    [createElement('span', styles.sendIcon), 'Send'],
    () => sendMessage(modal, config),
    styles.sendButton,
  );

  const stopBtn = button(
    createElement('span', styles.stopIcon),
    () => stopGeneration(modal),
    styles.iconButton,
    {
      title: 'Stop Generation',
    },
  );
  stopBtn.disable();

  const tryAgainBtn = button(
    createElement('span', styles.refreshIcon),
    () => tryAgain(modal, config),
    styles.iconButton,
    {
      title: 'Try Again',
    },
  );

  const buttonsColumn = createElement('div', styles.buttonsColumn);
  const actionButtonsRow = createElement('div', styles.actionButtonsRow);
  actionButtonsRow.append(stopBtn, tryAgainBtn);
  buttonsColumn.append(sendBtn, actionButtonsRow);

  modal.sendBtn = sendBtn;
  modal.tryAgainBtn = tryAgainBtn;
  modal.stopBtn = stopBtn;

  return buttonsColumn;
};
