Ext.onReady(function() {

    Ext.defer(function() {

        const labelEl = Ext.select('label[for="modx-resource-introtext"]').first();
        if (!labelEl) {
            return;
        }

        const introText = Ext.getCmp('modx-resource-introtext');
        if (!introText) return;

        const wandEl = document.createElement('span');
        wandEl.style.cursor = 'pointer';
        wandEl.style.marginLeft = '5px';
        wandEl.style.verticalAlign = 'middle';
        wandEl.style.fontSize = '24px';
        wandEl.innerText = '🪄'

        introText.label.appendChild(wandEl);

        wandEl.addEventListener('click', () => {
            Ext.Msg.wait('Generating summary...', 'Please wait');

            MODx.Ajax.request({
                url: MODx.config.connector_url,
                params: {
                    action: 'modAI\\Processors\\Prompt\\Summarize',
                    id: MODx.request.id
                },
                listeners: {
                    success: {
                        fn: (r) => {
                            introText.setValue(r.object.summary);
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
    }, 500);
});
