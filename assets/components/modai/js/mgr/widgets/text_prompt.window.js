modAI.window.TextPrompt = function(config) {
    config = config || {};

    this.addEvents('afterrender');

    const pagination = this.init(config);

    Ext.applyIf(config,{
        title: 'Text',
        closeAction: 'close',
        width: 600,
        autoHeight: true,
        fields: this.getFields(config),
        buttonAlign: 'left',
        modal: true,
        buttons: [
            ...pagination,
            '->',
            {
                text: _('cancel'),
                scope: this,
                handler: function() {
                    this.close();
                }
            },
            this.copyClose
        ],
    });

    modAI.window.TextPrompt.superclass.constructor.call(this,config);
};
Ext.extend(modAI.window.TextPrompt,MODx.Window, {
    init: function(config) {
        const syncUI = () => {
            info.update({currentPage: this._cache.visible + 1, total: this._cache.history.length})
            info.show();

            this.prompt.setValue(this._cache.history[this._cache.visible].prompt)
            this.preview.show();
            this.preview.setValue(this._cache.history[this._cache.visible].content);


            if (this._cache.visible <= 0) {
                prev.disable();
            } else {
                prev.enable();
            }

            if (this._cache.visible >= (this._cache.history.length - 1)) {
                next.disable();
            } else {
                next.enable();
            }
        }

        const addItem = (item) => {
            this._cache.visible = this._cache.history.push(item) - 1;

            syncUI();

            this.preview.show();
            this.copyClose.enable();
            prev.show();
            next.show();
        }

        const prev = new Ext.Button({
            hidden: true,
            text: '<<',
            handler: () => {
                this._cache.history[--this._cache.visible];
                syncUI();
            }
        });

        const next = new Ext.Button({
            hidden: true,
            text: '>>',
            handler: () => {
                this._cache.history[++this._cache.visible];
                syncUI();
            }
        });

        const info = new Ext.Component({
            hidden: true,
            data: {currentPage: 1, total: 1},
            tpl: new Ext.XTemplate(
                '<span style="margin-left: 10px;">{currentPage}/{total}</span>',
            )
        });

        this.prompt = new Ext.form.TextArea({
            fieldLabel: 'Prompt',
            name: 'prompt',
            anchor: '100%',
            required: true,
        });

        this.preview = new Ext.form.TextArea({
            hidden: true,
            anchor: '100%',
            height: '300px'
        });

        this.copyClose = new Ext.Button({
            text: 'Copy & Close',
            cls: 'primary-button',
            scope: this,
            handler: () => {
                this.preview.el.dom.select()
                this.preview.el.dom.setSelectionRange(0, this.preview.el.dom.value.length);

                // 4. Use the Clipboard API (modern approach)
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(this.preview.getValue())
                        .then(() => {
                            this.close();
                        })
                        .catch(() => {
                            Ext.Msg.alert("Failed", "Failed to copy the generated text. Please try again.");
                        });
                } else {
                    try {
                        document.execCommand("copy");
                        this.close();
                    } catch (err) {
                        Ext.Msg.alert("Failed", "Failed to copy the generated text. Please try again.");
                    }
                }
            },
            disabled: true
        });

        this.pagination = {
            addItem,
        };

        this._cache = config.cache;

        if (this._cache.history.length > 0) {
            this.addListener('afterrender', () => {
                syncUI();

                this.preview.show();
                this.copyClose.enable();
                prev.show();
                next.show();
            }, this, {single: true});

        }

        return [prev, next, info];
    },

    getFields: function(config) {

        return [
            this.prompt,
            {
                style: 'margin-top: 10px;',
                xtype: 'button',
                anchor: '100%',
                text: 'Generate',
                handler: () => {
                    const prompt = this.prompt.getValue();
                    if (!prompt) {
                        this.prompt.markInvalid("Prompt is required");
                        return;
                    }
                    this.prompt.clearInvalid();

                    Ext.Msg.wait('Generating ...', 'Please wait');

                    MODx.Ajax.request({
                        url: MODx.config.connector_url,
                        timeout: 0,
                        params: {
                            action: 'modAI\\Processors\\Prompt\\FreeText',
                            prompt: this.prompt.getValue(),
                            field: config.fieldName || ''
                        },
                        listeners: {
                            success: {
                                fn: (r) => {
                                    modAI.serviceExecutor(r.object).then((result) => {
                                        this.pagination.addItem({prompt: this.prompt.getValue(), content: result.content});
                                        Ext.Msg.hide();
                                    }).catch((err) => {
                                        Ext.Msg.hide();
                                        Ext.Msg.alert("Failed", `Failed to generated. Please try again. ${err.message}`);
                                    });
                                }
                            },
                            failure: {
                                fn: function() {
                                    Ext.Msg.hide();
                                    Ext.Msg.alert("Failed", "Failed to generated. Please try again.");
                                } ,
                                scope: this
                            }
                        }
                    });
                }
            },
            this.preview
        ];
    }
});
Ext.reg('modai-window-text_prompt', modAI.window.TextPrompt);
