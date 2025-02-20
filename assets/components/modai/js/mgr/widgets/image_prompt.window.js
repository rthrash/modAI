modAI.window.ImagePrompt = function(config) {
    config = config || {};

    const pagination = this.init();

    Ext.applyIf(config,{
        title: 'Image',
        closeAction: 'close',
        width: 600,
        autoHeight: true,
        url: MODx.config.connector_url,
        action: 'modAI\\Processors\\Download\\Image',
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
            this.downloadButton
        ]
    });

    modAI.window.ImagePrompt.superclass.constructor.call(this,config);
};
Ext.extend(modAI.window.ImagePrompt,MODx.Window, {
    _cache: {
        visible: -1,
        history: []
    },

    init: function() {
        const syncUI = () => {
            info.update({currentPage: this._cache.visible + 1, total: this._cache.history.length})
            info.show();

            const currentItem = this._cache.history[this._cache.visible];

            if (currentItem.url) {
                this.hidenUrl.setValue(currentItem.url);
            } else {
                this.hidenUrl.setValue('');
            }

            if (currentItem.base64) {
                this.hidenBase64.setValue(currentItem.base64);
            } else {
                this.hidenBase64.setValue('');
            }

            this.prompt.setValue(this._cache.history[this._cache.visible].prompt)
            this.imagePreview.update({url: currentItem?.url || currentItem.base64});


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

            this.imagePreview.show();
            this.downloadButton.enable();
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

        this.imagePreview = new Ext.Component({
            hidden: true,
            data: {url: ''},
            tpl: new Ext.XTemplate(
                '<img src="{url}" style="width:100%;margin-top:10px;" />',
            )
        });

        this.hidenUrl = new Ext.form.Hidden({
            name: 'url'
        });

        this.hidenBase64 = new Ext.form.Hidden({
            name: 'image'
        });

        this.downloadButton = new Ext.Button({
            text: _('save'),
            cls: 'primary-button',
            scope: this,
            handler: this.submit,
            disabled: true
        });

        this.pagination = {
            addItem,
        };

        this._cache = {
            visible: -1,
            history: []
        };

        return [prev, next, info];
    },

    getFields: function(config) {

        return [
            {
                xtype: 'hidden',
                name: 'resource'
            },
            {
                xtype: 'hidden',
                name: 'mediaSource'
            },
            {
                xtype: 'hidden',
                name: 'fieldName'
            },
            this.hidenUrl,
            this.hidenBase64,
            this.prompt,
            {
                style: 'margin-top: 10px;',
                xtype: 'button',
                anchor: '100%',
                text: 'Generate Image',
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
                            action: 'modAI\\Processors\\Prompt\\Image',
                            prompt: this.prompt.getValue(),
                            fieldName: config.record.fieldName || ''
                        },
                        listeners: {
                            success: {
                                fn: (r) => {
                                    modAI.serviceExecutor(r.object).then((result) => {
                                        this.pagination.addItem({prompt: this.prompt.getValue(), ...result});
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
            this.imagePreview
        ];
    }
});
Ext.reg('modai-window-image_prompt',modAI.window.ImagePrompt);
