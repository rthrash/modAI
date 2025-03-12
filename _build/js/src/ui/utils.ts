import { props } from '@stylexjs/stylex';

import { globalStyles } from './globalStyles';

import type { StyleXStyles } from '@stylexjs/stylex';

export const applyStyles = (element: HTMLElement, styleObj: StyleXStyles) => {
  Object.assign(element, props(globalStyles.resetStyles, styleObj));
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  type: K,
  styleObj?: StyleXStyles,
  content?: string | HTMLElement | (HTMLElement | string)[],
): HTMLElementTagNameMap[K] => {
  const textContent = typeof content === 'string' ? content : '';

  if (content && typeof content !== 'string' && !Array.isArray(content)) {
    content = [content];
  }

  const element = document.createElement(type);

  if (styleObj) {
    Object.assign(element, props(styleObj));
  }

  if (textContent) {
    element.textContent = textContent;
  } else if (content) {
    if (Array.isArray(content)) {
      content.forEach((i) => {
        if (typeof i === 'string') {
          element.append(document.createTextNode(i));
        } else {
          element.append(i);
        }
      });
    }
  }

  return element;
};

export const nlToBr = (content: string) => {
  return /<[^>]*>/g.test(content) ? content : content.replace(/\r\n|\n|\r/g, '<br>');
};
