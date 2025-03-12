import { create } from '@stylexjs/stylex';

import { createElement } from '../utils';
import { drag, endDrag, initDrag } from './dragHandlers';
import { renderMessage } from './messageHandlers';
import { closeModal } from './modalActions';
import { buildModalFooter } from './modalFooter';
import { buildPromptActions } from './promptActions';
import { buildPromptInput } from './promptInput';
import { chatHistory } from '../../chatHistory';
import { button } from '../dom/button';

import type { Modal, ModalConfig } from './types';

const styles = create({
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'none',
    zIndex: 100,
  },
  chatModal: {
    position: 'fixed',
    width: '1000px',
    minHeight: '170px',
    maxHeight: '600px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    display: 'none',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 101,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'height 0.3s ease-in-out',
  },
  chatHeader: {
    backgroundColor: 'white',
    color: 'black',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move',
  },
  chatTitle: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  chatControls: {
    display: 'flex',
    gap: '10px',
  },
  controlButton: {
    background: 'none',
    border: 'none',
    color: '#4B5563',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  chatMessages: {
    flex: '1',
    padding: '15px',
    overflowY: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    display: 'none',
  },
  chatInput: {
    display: 'flex',
    padding: '15px',
    backgroundColor: 'white',
    position: 'relative',
  },
  inputRow: {
    display: 'flex',
    width: '100%',
    gap: '10px',
  },
});

export const buildModal = (config: ModalConfig) => {
  const modalOverlay = createElement('div', styles.modalOverlay);

  const chatModal = createElement('div', styles.chatModal) as Modal;
  chatModal.history = chatHistory.init(`${config.key}/${config.type}`, (msg) => {
    return renderMessage(msg, chatModal, config);
  });

  const chatHeader = createElement('div', styles.chatHeader);
  const chatTitle = createElement('div', styles.chatTitle, 'modAI Assistant');
  const chatControls = createElement('div', styles.chatControls);

  const closeBtn = button('✕', () => closeModal(chatModal), styles.controlButton);
  chatControls.append(closeBtn);
  chatHeader.append(chatTitle, chatControls);

  const chatMessages = createElement('div', styles.chatMessages);

  const chatInputArea = createElement('div', styles.chatInput);

  const inputRow = createElement('div', styles.inputRow);
  const inputWrapper = buildPromptInput(chatModal, config);
  const buttonsColumn = buildPromptActions(chatModal, config);

  inputRow.append(inputWrapper, buttonsColumn);

  chatInputArea.append(inputRow);
  chatModal.append(chatHeader, chatMessages, chatInputArea);

  const modalFooter = buildModalFooter(chatModal, config);
  chatModal.append(modalFooter);

  if (config.overlay) {
    document.body.append(modalOverlay);
  }

  document.body.append(chatModal);

  if (chatModal.history.getMessages().length === 0) {
    chatModal.clearChatBtn.disable();
    chatModal.tryAgainBtn.disable();
  }

  chatHeader.addEventListener('mousedown', (e) => initDrag(e, chatModal));
  document.addEventListener('mousemove', (e) => drag(e, chatModal));
  document.addEventListener('mouseup', () => endDrag(chatModal));

  chatModal.modalOverlay = modalOverlay;
  chatModal.chatHeader = chatHeader;
  chatModal.closeBtn = closeBtn;
  chatModal.chatMessages = chatMessages;

  chatModal.inputWrapper = inputWrapper;
  chatModal.isDragging = false;
  chatModal.isLoading = false;
  chatModal.abortController = undefined;
  chatModal.offsetX = 0;
  chatModal.offsetY = 0;

  return chatModal;
};
