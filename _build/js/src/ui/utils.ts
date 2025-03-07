export const applyStyles = (element: HTMLElement, styleObj: Partial<CSSStyleDeclaration>) => {
    Object.assign(element.style, styleObj);
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(type: K, styleObj?: Partial<CSSStyleDeclaration>, textContent: string = ''): HTMLElementTagNameMap[K] => {
    const element = document.createElement(type);

    if (styleObj) {
        applyStyles(element, styleObj);
    }

    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

export const nlToBr = (content: string) => {
    return /<[^>]*>/g.test(content) ? content : content.replace(/\r\n|\n|\r/g, '<br>');
}
