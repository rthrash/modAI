import { create } from '@stylexjs/stylex';

import { applyStyles, createElement } from '../utils';
import { clearChat, switchType } from './modalActions';
import { button } from '../dom/button';

import type { Modal, ModalConfig } from './types';

const styles = create({
  button: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    opacity: '1',
    justifyItems: 'center',
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  modalFooter: {
    padding: '5px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  typeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  typeLabel: {
    fontSize: '14px',
    color: '#4B5563',
    fontWeight: '500',
  },
  typeToggleGroup: {
    display: 'flex',
    gap: '4px',
  },
  typeToggleButton: {
    margin: 0,
    padding: '6px 12px',
    fontSize: '13px',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    backgroundColor: '#fff',
    color: '#4B5563',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: '1',
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  typeToggleButtonActive: {
    backgroundColor: '#00B6DE',
    color: '#fff',
    borderColor: '#00B6DE',
    cursor: 'default',
    ':disabled': {
      opacity: '1',
      cursor: 'not-allowed',
    },
  },
});

export const buildModalFooter = (modal: Modal, config: ModalConfig) => {
  const modalFooter = createElement('div', styles.modalFooter);

  const typeSelector = createElement('div', styles.typeSelector);
  const typeLabel = createElement('div', styles.typeLabel, 'Generate:');
  const typeToggleGroup = createElement('div', styles.typeToggleGroup);

  const typeButtons: { [key: string]: HTMLButtonElement } = {};
  const availableTypes = config.availableTypes ?? [];

  availableTypes.forEach((type) => {
    const button = createElement(
      'button',
      styles.typeToggleButton,
      type.charAt(0).toUpperCase() + type.slice(1),
    ) as HTMLButtonElement;
    if (type === config.type) {
      applyStyles(button, [styles.typeToggleButton, styles.typeToggleButtonActive]);
      button.disabled = true;
    }

    button.addEventListener('click', () => {
      if (type === config.type) {
        return;
      }

      Object.values(typeButtons).forEach((btn) => {
        applyStyles(btn, styles.typeToggleButton);
        btn.disabled = false;
      });

      applyStyles(button, [styles.typeToggleButton, styles.typeToggleButtonActive]);
      button.disabled = true;

      switchType(type, modal, config);
    });
    typeButtons[type] = button;
    typeToggleGroup.appendChild(button);
  });

  typeSelector.append(typeLabel, typeToggleGroup);

  const clearChatBtn = button('Clear Chat', () => clearChat(modal), styles.button);

  modalFooter.append(typeSelector);
  modalFooter.append(clearChatBtn);

  modal.clearChatBtn = clearChatBtn;
  modal.typeSelector = typeSelector;
  modal.typeButtons = typeButtons;

  return modalFooter;
};
