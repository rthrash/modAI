import { createElement } from '../utils';

export const icon = (size: number, icon: string) => {
  const div = createElement('div', 'icon');
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;
  div.innerHTML = icon.trim();

  return div;
};
