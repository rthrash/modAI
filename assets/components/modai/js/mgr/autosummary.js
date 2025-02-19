Ext.onReady(function() {

    const cache = {
        _cache: {},
        _setFieldValue (key, value) {
            const cachedItem = this._cache[key];

            cachedItem.els.forEach(({wrapper, field}) => {
                const prevValue = field.getValue();
                field.setValue(value);
                field.fireEvent('change', field, value, prevValue);

                wrapper.historyNav.info.update(cachedItem.visible + 1, cachedItem.values.length);

                if (cachedItem.visible <= 0) {
                    wrapper.historyNav.prevButton.disable();
                } else {
                    wrapper.historyNav.prevButton.enable();
                }

                if (cachedItem.visible === cachedItem.values.length - 1) {
                    wrapper.historyNav.nextButton.disable();
                } else {
                    wrapper.historyNav.nextButton.enable();
                }
            });
        },
        init (key, field, wrapper) {
            if (!this._cache[key]) {
                this._cache[key] = {
                    els: [{ field, wrapper }],
                    visible: -1,
                    values: []
                };
            }

            this._cache[key].els.push({ field, wrapper });
            const currentValue = field.getValue();
            if (currentValue) {
                this._cache[key].values = [currentValue];
                this._cache[key].visible = 0;
            }
        },
        store (key, value) {
            const cachedItem = this._cache[key];

            cachedItem.visible = cachedItem.values.push(value) - 1;

            if (cachedItem.values.length > 1) {
                cachedItem.els.forEach(({wrapper}) => {
                    wrapper.historyNav.show();
                });
            }

            this._setFieldValue(key, cachedItem.values[cachedItem.visible]);
        },
        next (key) {
            const cachedItem = this._cache[key];

            if (cachedItem.visible === cachedItem.values.length - 1) {
                return;
            }

            this._setFieldValue(key, cachedItem.values[++cachedItem.visible]);
        },
        prev (key) {
            const cachedItem = this._cache[key];

            if (cachedItem.visible <= 0) {
                return;
            }

            this._setFieldValue(key, cachedItem.values[--cachedItem.visible]);
        }
    };
    const freePromptCache = {
        _cache: {},
        get(key) {
            if (!this._cache[key]) {
                this._cache[key] = {
                    visible: -1,
                    history: []
                }
            }

            return this._cache[key];
        }
    };

    const createWandEl = () => {
        const wandEl = document.createElement('button');
        wandEl.className = 'modai-generate';
        wandEl.innerText = '✦'
        wandEl.type = 'button'
        wandEl.title = 'Generate using AI'

        return wandEl;
    }

    const createHistoryNav = (field, fieldName) => {
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.title = 'Previous Version';
        prevButton.className = 'modai-history_prev';
        prevButton.disable = () => {
            prevButton.disabled = true;
        }
        prevButton.enable = () => {
            prevButton.disabled = false;
        }
        prevButton.innerHTML = 'prev';
        prevButton.addEventListener('click', () => {
            cache.prev(fieldName);
        });

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.title = 'Next Version';
        nextButton.className = 'modai-history_next';
        nextButton.disable = () => {
            nextButton.disabled = true;
        }
        nextButton.enable = () => {
            nextButton.disabled = false;
        }
        nextButton.innerHTML = 'next';
        nextButton.addEventListener('click', () => {
            cache.next(fieldName);
        });

        const info = document.createElement('span');
        info.update = (showing, total) => {
            info.innerText = `${showing}/${total}`;
        }
        info.innerText = '';

        const wrapper = document.createElement('span');
        wrapper.show = () => {
            wrapper.style.display = 'initial';
        }

        wrapper.hide = () => {
            wrapper.style.display = 'none';
        }

        wrapper.prevButton = prevButton;
        wrapper.nextButton = nextButton;
        wrapper.info = info;

        wrapper.appendChild(prevButton);
        wrapper.appendChild(nextButton);
        wrapper.appendChild(info);

        wrapper.hide();
        prevButton.disable();
        nextButton.disable();

        return wrapper;
    }

    const createFreeTextPrompt = (cacheKey, fieldName) => {
        const wandEl = createWandEl();
        wandEl.addEventListener('click', () => {
            const win = MODx.load({
                xtype: 'modai-window-text_prompt',
                title: 'Text',
                field: fieldName,
                cache: freePromptCache.get(cacheKey)
            });

            win.show();
        });

        return wandEl;
    }

    const createForcedTextPrompt = (field, fieldName) => {
        const aiWrapper = document.createElement('span');
        const historyNav = createHistoryNav(field, fieldName);

        aiWrapper.historyNav = historyNav;

        const wandEl = createWandEl();
        wandEl.addEventListener('click', () => {
            Ext.Msg.wait('Generating ...', 'Please wait');

            MODx.Ajax.request({
                url: MODx.config.connector_url,
                timeout: 0,
                params: {
                    action: 'modAI\\Processors\\Prompt\\Text',
                    id: MODx.request.id,
                    field: fieldName
                },
                listeners: {
                    success: {
                        fn: (r) => {
                            cache.store(fieldName, r.object.content);
                            Ext.Msg.hide();
                        }
                    },
                    failure: {
                        fn: function() {
                            Ext.Msg.alert("Failed", "Failed to generated. Please try again.");
                            Ext.Msg.hide();
                        } ,
                        scope: this
                    }
                }
            });
        });

        aiWrapper.appendChild(wandEl);
        aiWrapper.appendChild(historyNav);

        cache.init(fieldName, field, aiWrapper);

        return aiWrapper;
    }

    const createImagePrompt = (defaultPrompt, onSuccess) => {
        const imageWand = createWandEl();
        imageWand.addEventListener('click', () => {
            const createColumn = MODx.load({
                xtype: 'modai-window-image_prompt',
                title: 'Image',
                record: {
                    resource: MODx.request.id,
                    prompt: defaultPrompt,
                },
                listeners: {
                    success: {
                        fn: onSuccess,
                        scope:this
                    }
                }
            });

            createColumn.show();
        });

        return imageWand;
    }

    const attachField = (cmp, fieldName) => {
        const field = Ext.getCmp(cmp);
        if (!field) return;

        const wrapper = document.createElement('span');
        const historyNav = createHistoryNav(field, fieldName);

        wrapper.historyNav = historyNav;

        const wandEl = createWandEl();
        wandEl.addEventListener('click', () => {
            Ext.Msg.wait('Generating ...', 'Please wait');

            MODx.Ajax.request({
                url: MODx.config.connector_url,
                timeout: 0,
                params: {
                    action: 'modAI\\Processors\\Prompt\\Text',
                    id: MODx.request.id,
                    field: fieldName
                },
                listeners: {
                    success: {
                        fn: (r) => {
                            cache.store(fieldName, r.object.content);
                            Ext.Msg.hide();
                        }
                    },
                    failure: {
                        fn: function() {
                            Ext.Msg.alert("Failed", "Failed to generated. Please try again.");
                            Ext.Msg.hide();
                        } ,
                        scope: this
                    }
                }
            });
        });

        wrapper.appendChild(wandEl);
        wrapper.appendChild(historyNav);

        cache.init(fieldName, field, wrapper);

        field.label.appendChild(wrapper);
    }

    const attachImagePlus = (imgPlusPanel) => {
        const imagePlus = Ext.getCmp(imgPlusPanel.firstChild.id);

        const imageWand = createImagePrompt(
            // Ext.getCmp('modx-resource-introtext').getValue(),
            '',
            function(res) {
                imagePlus.imageBrowser.setValue(res.a.result.object.url);
                imagePlus.onImageChange(res.a.result.object.url)
            }
        );

        const altTextWand = createWandEl();
        altTextWand.style.marginTop = '6px';
        altTextWand.addEventListener('click', () => {
            const imgElement = imagePlus.imagePreview.el.dom;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = imgElement.width;
            canvas.height = imgElement.height;

            ctx.drawImage(imgElement, 0, 0);

            const base64Data = canvas.toDataURL('image/png');

            Ext.Msg.wait('Generating ...', 'Please wait');

            MODx.Ajax.request({
                url: MODx.config.connector_url,
                timeout: 0,
                params: {
                    action: 'modAI\\Processors\\Prompt\\Vision',
                    image: base64Data
                },
                listeners: {
                    success: {
                        fn: (r) => {
                            imagePlus.altTextField.items.items[0].setValue(r.object.content);
                            imagePlus.image.altTag = r.object.content;
                            imagePlus.updateValue();
                            Ext.Msg.hide();
                        }
                    },
                    failure: {
                        fn: function() {
                            Ext.Msg.alert("Failed", "Failed to generated. Please try again.");
                            Ext.Msg.hide();
                        } ,
                        scope: this
                    }
                }
            });
        });

        imagePlus.altTextField.el.dom.style.display = 'flex';
        imagePlus.altTextField.el.dom.style.justifyItems = 'center';
        imagePlus.altTextField.el.dom.style.alignItems = 'center';

        imagePlus.el.dom.parentElement.parentElement.parentElement.querySelector('label').appendChild(imageWand);
        imagePlus.altTextField.el.dom.appendChild(altTextWand);
    };

    const attachContent = () => {
        const cmp = Ext.getCmp('modx-resource-content');
        const label = cmp.el.dom.querySelector('label');
        label.appendChild(createFreeTextPrompt('modx-resource-content', 'res.content'));
    };

    const attachTVs = () => {
        const form = Ext.getCmp('modx-panel-resource').getForm();
        for (const [tvId, tvName] of (modAI?.tvs || [])) {
            const wrapper = Ext.get(`tv${tvId}-tr`);
            if (!wrapper) {
                continue;
            }

            const field = form.findField(`tv${tvId}`);
            if (!field) {
                const imgPlusPanel = wrapper.dom.querySelector('.imageplus-panel-input');
                if (imgPlusPanel) {
                    attachImagePlus(imgPlusPanel);
                }
                continue;
            }

            if (field.xtype === 'textfield' || field.xtype === 'textarea') {
                const prompt = MODx.config[`modai.tv.${tvName}.prompt`];

                const label = wrapper.dom.querySelector('label');
                const fieldName = `tv.${tvName}`;

                if (prompt) {
                    label.appendChild(createForcedTextPrompt(field, fieldName));
                } else {
                    label.appendChild(createFreeTextPrompt(`tv${tvId}`, fieldName));
                }
            }

            if (field.xtype === 'modx-panel-tv-image') {
                const imageWand = createImagePrompt(
                    '',
                    function(res) {
                        const eventData = {
                            relativeUrl: res.a.result.object.url,
                            url: res.a.result.object.url
                        };

                        field.items.items[1].fireEvent('select', eventData)
                        field.fireEvent('select', eventData);
                    }
                );

                const label = wrapper.dom.querySelector('label');
                label.appendChild(imageWand);
            }
        }

    }

    const attachResourceFields = () => {
        const fieldsMap = {
            pagetitle: ['modx-resource-pagetitle'],
            longtitle: ['modx-resource-longtitle', 'seosuite-longtitle'],
            introtext: ['modx-resource-introtext'],
            description: ['modx-resource-description', 'seosuite-description'],
            content: ['modx-resource-content'],
        };

        for (const field of modAI?.resourceFields || []) {
            if (!fieldsMap[field]) {
                continue;
            }

            if (field === 'content') {
                attachContent();
                continue;
            }

            fieldsMap[field].forEach((cmpId) => {
                attachField(cmpId, `res.${field}`);
            })

        }
    }

    Ext.defer(function() {
        attachResourceFields();
        attachTVs();
    }, 500);
});
