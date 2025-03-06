export type Message = {
    content: string;
    id?: string;
    hidden: boolean;
    role: string;
    el?: HTMLDivElement;
};

type Namespace = {
    history: Message[];
    idRef: Record<string, Message>;
    onAddMessage: (msg: Message) => HTMLDivElement | undefined;
    onUpdateMessage: (message: Message) => void;
};

const _namespace: Record<string, Namespace> = {};

const ROLES = {
    'user': 'user',
    'assistant': 'assistant',
};

const addMessage = (key: string, content: string, role: string, id?: string, hidden: boolean = false) => {
    const namespace = _namespace[key];
    if (!namespace) {
        return;
    }

    const msgObject: Message = {content, role, id, hidden};

    msgObject.el = namespace.onAddMessage(msgObject);

    const index = namespace.history.push(msgObject) - 1;
    if (id) {
        namespace.idRef[id] = namespace.history[index];
    }
}

const updateMessage = (key: string, id: string, content: string) => {
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

const getMessage = (key: string, id: string) => {
    const namespace = _namespace[key];
    if (!namespace) {
        return;
    }

    return namespace.idRef[id];
}

export const chatHistory = {
    init: (key: string, onAddMessage: (msg: Message) => HTMLDivElement | undefined, onUpdateMessage: (msg: Message) => void) => {
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
            addUserMessage: (content: string, hidden?: boolean) => {
                addMessage(key, content, ROLES.user, undefined, hidden);
            },
            addAssistantMessage: (content: string, id: string) => {
                addMessage(key, content, ROLES.assistant, id);
            },
            updateAssistantMessage: (id: string, content: string) => {
                updateMessage(key, id, content);
            },
            getAssistantMessage: (id: string) => {
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
