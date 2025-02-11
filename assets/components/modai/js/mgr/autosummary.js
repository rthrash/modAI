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

    const createWantEl = () => {
        const wandEl = document.createElement('span');
        wandEl.style.cursor = 'pointer';
        wandEl.style.marginLeft = '5px';
        wandEl.style.verticalAlign = 'middle';
        wandEl.style.fontSize = '24px';
        wandEl.innerText = '🪄'

        return wandEl;
    }

    const createGenerateButton = (field, fieldName) => {
        const wandEl = createWantEl();

        wandEl.addEventListener('click', () => {
            Ext.Msg.wait('Generating ...', 'Please wait');

            MODx.Ajax.request({
                url: MODx.config.connector_url,
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
                            console.log('fail');
                        } ,
                        scope: this
                    }
                }
            });
        });

        return wandEl;
    }

    const createHistoryNav = (field, fieldName) => {
        const prevButton = document.createElement('button');
        prevButton.disable = () => {
            prevButton.disabled = true;
        }
        prevButton.enable = () => {
            prevButton.disabled = false;
        }
        prevButton.innerHTML = '<<';
        prevButton.addEventListener('click', () => {
            cache.prev(fieldName);
        });

        const nextButton = document.createElement('button');
        nextButton.disable = () => {
            nextButton.disabled = true;
        }
        nextButton.enable = () => {
            nextButton.disabled = false;
        }
        nextButton.innerHTML = '>>';
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

    const attach = (cmp, fieldName) => {
        const field = Ext.getCmp(cmp);
        if (!field) return;

        const wrapper = document.createElement('span');
        const historyNav = createHistoryNav(field, fieldName);

        wrapper.historyNav = historyNav;

        wrapper.appendChild(createGenerateButton(field, fieldName));
        wrapper.appendChild(historyNav);

        cache.init(fieldName, field, wrapper);

        field.label.appendChild(wrapper);
    }

    const attachImagePlus = () => {
        document.querySelectorAll('.imageplus-panel-input').forEach((el) => {
            const imagePlus = Ext.getCmp(el.firstChild.id);

            const imageWand = createWantEl();
            imageWand.addEventListener('click', () => {
                const createColumn = MODx.load({
                    xtype: 'modai-window-image_prompt',
                    title: 'Image',
                    record: {
                        resource: MODx.request.id,
                        prompt: Ext.getCmp('modx-resource-introtext').getValue(),
                    },
                    listeners: {
                        'success': {fn:function(res) {
                            imagePlus.imageBrowser.setValue(res.a.result.object.url);
                            imagePlus.onImageChange(res.a.result.object.url)
                        },scope:this}
                    }
                });

                createColumn.show();
            });

            const altTextWand = createWantEl();
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
                    params: {
                        action: 'modAI\\Processors\\Prompt\\Vision',
                        image: base64Data
                    },
                    listeners: {
                        success: {
                            fn: (r) => {
                                imagePlus.items.items[1].items.items[1].items.items[0].setValue(r.object.content);
                                Ext.Msg.hide();
                            }
                        },
                        failure: {
                            fn: function() {
                                console.log('fail');
                            } ,
                            scope: this
                        }
                    }
                });
            });

            imagePlus.items.items[0].el.dom.appendChild(imageWand);
            imagePlus.items.items[1].items.items[1].el.dom.appendChild(altTextWand);
        })
    };

    Ext.defer(function() {
        attach('modx-resource-pagetitle', 'pagetitle');

        attach('modx-resource-introtext', 'introtext');

        attach('modx-resource-longtitle', 'longtitle');
        attach('seosuite-longtitle', 'longtitle');

        attach('modx-resource-description', 'description');
        attach('seosuite-description', 'description');

        attachImagePlus();

    }, 500);
});
