import type { Modal } from './types';

export const initDrag = (e: MouseEvent, modal: Modal) => {
  modal.isDragging = true;

  const rect = modal.getBoundingClientRect();

  modal.offsetX = e.clientX - rect.left;
  modal.offsetY = e.clientY - rect.top;

  document.body.style.userSelect = 'none';
};

export const drag = (e: MouseEvent, modal: Modal) => {
  if (!modal.isDragging) return;

  const newX = e.clientX - modal.offsetX;
  const newY = e.clientY - modal.offsetY;

  modal.style.left = newX + 'px';
  modal.style.top = newY + 'px';

  modal.style.transform = 'none';
};

export const endDrag = (modal: Modal) => {
  modal.isDragging = false;
  document.body.style.userSelect = '';
};
