import { applyStyles, createElement } from '../utils';

export type Button = HTMLButtonElement & {
  enable: () => void;
  disable: () => void;
};

export const button = (
  content: string | HTMLElement | (HTMLElement | string)[],
  onClick: () => Promise<void> | void,
  styleObj: Partial<CSSStyleDeclaration> = {},
  disabledStyleObj: Partial<CSSStyleDeclaration> = {},
  btnProps?: Partial<HTMLButtonElement>,
) => {
  const textContent = typeof content === 'string' ? content : '';

  if (typeof content !== 'string' && !Array.isArray(content)) {
    content = [content];
  }

  const el = createElement('button', styleObj, textContent) as Button;
  el.type = 'button';

  if (Array.isArray(content)) {
    content.forEach((i) => {
      if (typeof i === 'string') {
        el.append(document.createTextNode(i));
      } else {
        el.append(i);
      }
    });
  }

  el.addEventListener('click', onClick);

  el.enable = () => {
    el.disabled = false;
    applyStyles(el, styleObj);
  };

  el.disable = () => {
    el.disabled = true;
    applyStyles(el, { ...styleObj, ...disabledStyleObj });
  };

  if (btnProps) {
    Object.assign(el, btnProps);
  }

  return el;
};
