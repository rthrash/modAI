(() => {
    const _namespace = {};

    const ROLES = {
        'user': 'user',
        'assistant': 'assistant',
    };

    const addMessage = (key, content, role, id, hidden = false) => {
        const namespace = _namespace[key];
        if (!namespace) {
            return;
        }

        const msgObject = {content, role, id, hidden};

        msgObject.el = namespace.onAddMessage(msgObject);

        const index = namespace.history.push(msgObject) - 1;
        if (id) {
            namespace.idRef[id] = namespace.history[index];
        }
    }

    const updateMessage = (key, id, content) => {
        const namespace = _namespace[key];
        if (!namespace) {
            return;
        }

        if (!namespace.idRef[id]) {
            addMessage(key, content, ROLES.assistant, id);
            return;
        }

        namespace.idRef[id].content = content;
        namespace.onUpdateMessage(namespace.idRef[id]);
    }

    const getMessage = (key, id) => {
        const namespace = _namespace[key];
        if (!namespace) {
            return;
        }

        return namespace.idRef[id];
    }

    modAI.chatHistory = {
        init: (key, onAddMessage, onUpdateMessage) => {
            if (!_namespace[key]) {
                _namespace[key] = {
                    history: [],
                    idRef: {},
                    onAddMessage,
                    onUpdateMessage,
                };
            }

            _namespace[key].onAddMessage = onAddMessage;
            _namespace[key].onUpdateMessage = onUpdateMessage;

            return {
                addUserMessage: (content, hidden = false) => {
                    addMessage(key, content, ROLES.user, undefined, hidden);
                },
                addAssistantMessage: (content, id) => {
                    addMessage(key, content, ROLES.assistant, id);
                },
                updateAssistantMessage: (id, content) => {
                    updateMessage(key, id, content);
                },
                getAssistantMessage: (id) => {
                    return getMessage(key, id);
                },
                getMessages: () => {
                    return _namespace[key].history;
                },
                getMessagesHistory: () => {
                    return _namespace[key].history.map((m) => ({
                        role: m.role,
                        content: m.content,
                    }));
                }
            };
        }
    };
})();
