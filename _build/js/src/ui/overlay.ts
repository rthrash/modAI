type TextareaOverlayOptions = {
    indicatorType?: 'spinner' | 'dots';
    overlayColor?: string;
    indicatorColor?: string;
}

export const createLoadingOverlay = (element: HTMLElement, options: TextareaOverlayOptions = {}) => {
    const config = {
        indicatorType: options.indicatorType || 'spinner',
        overlayColor: options.overlayColor || 'rgba(255, 255, 255, 0.7)',
        indicatorColor: options.indicatorColor || '#3498db'
    };

    const overlay: HTMLDivElement = document.createElement('div');
    const indicator: HTMLDivElement = document.createElement('div');

    const textareaStyles: CSSStyleDeclaration = window.getComputedStyle(element);
    const textareaRect: DOMRect = element.getBoundingClientRect();

    if (!options.indicatorColor) {
        config.indicatorType = textareaRect.height <= 50 ? 'dots' : 'spinner';
    }

    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = config.overlayColor;
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';
    overlay.style.borderRadius = textareaStyles.borderRadius;

    let styleText = '';

    if (config.indicatorType === 'spinner') {
        // Apply styles to the spinner
        indicator.style.border = `4px solid #f3f3f3`;
        indicator.style.borderTop = `4px solid ${config.indicatorColor}`;
        indicator.style.borderRadius = '50%';
        indicator.style.width = '30px';
        indicator.style.height = '30px';
        indicator.style.animation = 'textareaOverlaySpin 1s linear infinite';

        // Add spinner animation
        styleText = `
      @keyframes textareaOverlaySpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    } else if (config.indicatorType === 'dots') {
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.justifyContent = 'center';
        indicator.style.height = '20px';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = config.indicatorColor;
            dot.style.margin = '0 4px';
            dot.style.animation = `textareaOverlayDotPulse 1.4s infinite ease-in-out`;
            dot.style.animationDelay = `${i * 0.2}s`;
            indicator.appendChild(dot);
        }

        styleText = `
      @keyframes textareaOverlayDotPulse {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }
    `;
    }

    const styleSheet: HTMLStyleElement = document.createElement('style');
    styleSheet.textContent = styleText;
    document.head.appendChild(styleSheet);

    overlay.appendChild(indicator);

    const parentStyles: CSSStyleDeclaration = window.getComputedStyle(element.parentElement as Element);
    let wrapper: HTMLElement;

    if (['relative', 'absolute', 'fixed'].indexOf(parentStyles.position) === -1) {
        wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = `${textareaRect.width}px`;
        wrapper.style.height = `${textareaRect.height}px`;
        wrapper.style.display = 'inline-block';

        element.parentNode?.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    } else {
        wrapper = element.parentElement as HTMLElement;
    }

    overlay.style.display = 'none';
    wrapper.appendChild(overlay);

    const updatedRect: DOMRect = element.getBoundingClientRect();
    if (wrapper !== element.parentElement) {
        wrapper.style.width = `${updatedRect.width}px`;
        wrapper.style.height = `${updatedRect.height}px`;
    }

    overlay.style.display = 'flex';
    element.setAttribute('disabled', 'disabled');

    return (): void => {
        overlay.style.display = 'none';
        element.removeAttribute('disabled');

        overlay.remove();
        styleSheet.remove();
        if (wrapper !== element.parentElement) {
            wrapper.parentNode?.insertBefore(element, wrapper);
            wrapper.remove();
        }
    };
}
