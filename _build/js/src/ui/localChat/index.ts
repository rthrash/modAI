import { closeModal, openModal, sendMessage } from './modalActions';
import { buildModal } from './modalBuilder';
import { globalState } from './state';

import type { ModalConfig } from './types';

export const modalTypes = ['text', 'image'] as const;

export const createModal = (config: ModalConfig) => {
  if (globalState.modalOpen) {
    return;
  }

  if (!config.key) {
    alert('key is required config property');
    return;
  }

  if (config.overlay === undefined) {
    config.overlay = true;
  }

  if (!config.type) {
    config.type = 'text';
  }

  if (!config.availableTypes) {
    config.availableTypes = [];
  }

  config.availableTypes = config.availableTypes.filter((type) => modalTypes.includes(type));

  if (config.availableTypes.length > 0 && !config.availableTypes.includes(config.type)) {
    config.availableTypes.unshift(config.type);
  }

  const modal = buildModal(config);

  modal.api = {
    sendMessage: async (providedMessage?: string, hidePrompt?: boolean) => {
      await sendMessage(modal, config, providedMessage, hidePrompt);
    },
    closeModal: () => {
      closeModal(modal);
    },
  };

  openModal(modal, config);
  globalState.modalOpen = true;

  return modal;
};
