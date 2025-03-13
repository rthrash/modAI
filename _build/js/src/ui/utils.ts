export const applyStyles = (element: HTMLElement, styleObj: string) => {
  element.className = styleObj;
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  type: K,
  styleObj?: string,
  content?: string | HTMLElement | Element | (Element | HTMLElement | string)[],
  elProps?: Partial<HTMLElementTagNameMap[K]>,
): HTMLElementTagNameMap[K] => {
  const textContent = typeof content === 'string' ? content : '';

  if (content && typeof content !== 'string' && !Array.isArray(content)) {
    content = [content];
  }

  const element = document.createElement(type);
  if (elProps) {
    Object.assign(element, elProps);
  }

  if (styleObj) {
    element.className = styleObj;
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
