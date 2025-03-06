(() => {
    const services = {
        buffered: {
            chatgpt: {
                content: (data) => {
                    const content = data?.choices?.[0]?.message?.content;

                    if (!content) {
                        throw new Error(_('modai.cmp.failed_request'));
                    }

                    const id = data.id;

                    return {
                        id,
                        content,
                    }
                },
                image: (data) => {
                    const url = data?.data?.[0]?.url;

                    if (!url) {
                        throw new Error(_('modai.cmp.failed_request'));
                    }

                    return {
                        url
                    }
                }
            },
            claude: {
                content: (data) => {
                    const content = data?.content?.[0]?.text;

                    if (!content) {
                        throw new Error(_('modai.cmp.failed_request'));
                    }

                    const id = data.id;

                    return {
                        id,
                        content,
                    }
                }
            },
            gemini: {
                content: (data) => {
                    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (!content) {
                        throw new Error(_('modai.cmp.failed_request'));
                    }

                    return {
                        id: `gemini-${Date.now()}-${Math.round(Math.random()*1000)}`,
                        content,
                    }
                },
                image: (data) => {
                    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;

                    if (!base64) {
                        throw new Error(_('modai.cmp.failed_request'));
                    }

                    return {
                        base64: `data:image/png;base64,${base64}`
                    }
                }
            }
        },
        stream: {
            chatgpt: {
                content: (newData, currentData = {}) => {
                    const currentContent = currentData?.content ?? '';
                    const content = newData.choices[0]?.delta?.content || '';

                    return {
                        ...currentData,
                        id: newData.id,
                        content: `${currentContent}${content}`
                    };
                }
            },
            claude: {
                content: (newData, currentData = undefined) => {
                    const currentContent = currentData?.content ?? '';

                    const content = newData.delta?.text || '';

                    return {
                        ...currentData,
                        content: `${currentContent}${content}`
                    };
                }
            },
            gemini: {
                content: (newData, currentData = {}) => {
                    const currentContent = currentData?.content ?? '';

                    const content = newData.candidates[0]?.content?.parts[0]?.text || '';

                    return {
                        ...currentData,
                        content: `${currentContent}${content}`
                    };
                }
            }
        },
    };

    const errorHandler = async (res) => {
        if (!res.ok) {
            const data = await res.json();
            if (data?.error) {
                throw new Error(data.error.message);
            }

            throw new Error(`${res.status} ${res.statusText}`);
        }
    }

    const handleStream = async (res, service, parser, onChunkStream, signal) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let currentData = {
            id: `${service}-${Date.now()}-${Math.round(Math.random()*1000)}`
        };


        while (true) {
            if (signal && signal.aborted) {
                break;
            }

            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, {stream: true});

            if (service === 'gemini') {
                const jsonLines = chunk.trim().split(",\r\n").map((line) => line.replace(/^\[|\]$/g, '')).filter(line => line.trim() !== '');
                for (const line of jsonLines) {
                    try {
                        const parsedData = JSON.parse(line);
                        currentData = services.stream[service][parser](parsedData, currentData);
                        if (onChunkStream) {
                            onChunkStream(currentData);
                        }
                    } catch {
                    }
                }
            }

            if (service === 'chatgpt') {
                buffer += chunk;

                let lastNewlineIndex = 0;
                let newlineIndex;

                while ((newlineIndex = buffer.indexOf('\n', lastNewlineIndex)) !== -1) {
                    const line = buffer.slice(lastNewlineIndex, newlineIndex).trim();
                    lastNewlineIndex = newlineIndex + 1;

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            continue;
                        }

                        try {
                            const parsedData = JSON.parse(data);
                            currentData = services.stream[service][parser](parsedData, currentData);
                            if (onChunkStream) {
                                onChunkStream(currentData);
                            }
                        } catch {
                        }
                    }
                }

                buffer = buffer.slice(lastNewlineIndex);
            }

            if (service === 'claude') {
                buffer += chunk;

                let lastNewlineIndex = 0;
                let newlineIndex;

                while ((newlineIndex = buffer.indexOf('\n', lastNewlineIndex)) !== -1) {
                    const line = buffer.slice(lastNewlineIndex, newlineIndex).trim();
                    lastNewlineIndex = newlineIndex + 1;

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        try {
                            const parsedData = JSON.parse(data);
                            if (parsedData.type === 'message_start') {
                                currentData.id = parsedData.message.id;
                                continue;
                            }

                            if (parsedData.type !== 'content_block_delta') {
                                continue;
                            }

                            currentData = services.stream[service][parser](parsedData, currentData);
                            if (onChunkStream) {
                                onChunkStream(currentData);
                            }
                        } catch {}
                    }
                }

                buffer = buffer.slice(lastNewlineIndex);
            }
        }

        return currentData;

    }

    const serviceExecutor = async (details, onChunkStream = undefined, controller = undefined) => {
        if (!details.forExecutor) {
            return details;
        }

        const executorDetails = details.forExecutor;

        controller = !controller ? new AbortController() : controller;
        const signal = controller.signal;

        const callService = async (details) => {
            const res = await fetch(details.url, {
                signal,
                method: 'POST',
                body: details.body,
                headers: details.headers
            });

            await errorHandler(res);

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            return data;
        }

        const callStreamService = async (details) => {
            const res = await fetch(details.url, {
                signal,
                method: 'POST',
                body: details.body,
                headers: details.headers
            });

            await errorHandler(res);

            return handleStream(res, executorDetails.service, executorDetails.parser, onChunkStream);
        }

        if (!executorDetails.service || !executorDetails.parser) {
            throw new Error(_('modai.cmp.service_required'));
        }

        if (!services[executorDetails.stream ? 'stream' : 'buffered']?.[executorDetails.service]?.[executorDetails.parser]) {
            throw new Error(_('modai.cmp.service_unsupported'));
        }

        if (executorDetails.stream) {
            return callStreamService(executorDetails)
        }

        const data = await callService(executorDetails);
        return services['buffered'][executorDetails.service][executorDetails.parser](data);
    }

    const modxFetch = async (action, params) => {
        const res = await fetch(`${modAI.apiURL}?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            throw new Error(data.detail);
        }

        return res.json();
    }

    const aiFetch = async (action, params, onChunkStream = undefined, controller = undefined) => {
        controller = !controller ? new AbortController() : controller;
        const signal = controller.signal;

        const res = await fetch(`${modAI.apiURL}?action=${action}`, {
            signal,
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            throw new Error(data.detail);
        }

        const service = res.headers.get('x-modai-service') ?? 'chatgpt';
        const parser = res.headers.get('x-modai-parser') ?? 'content';
        const stream = parseInt(res.headers.get('x-modai-stream')) === 1;
        const proxy = parseInt(res.headers.get('x-modai-proxy')) === 1;

        if (!proxy) {
            const data = await res.json();
            return serviceExecutor(data, onChunkStream, controller);
        }

        if (!service || !parser) {
            controller.abort();
            throw new Error(_('modai.cmp.service_required'));
        }

        if (!services[stream ? 'stream' : 'buffered']?.[service]?.[parser]) {
            controller.abort();
            throw new Error(_('modai.cmp.service_unsupported'));
        }

        if (!stream) {
            const data = await res.json();
            return services['buffered'][service][parser](data);
        }

        return handleStream(res, service, parser, onChunkStream, signal);
    }

    modAI.executor = {
        mgr: {
            download: {
                image: async (params) => {
                    return await modxFetch('Download\\Image', params);
                }
            },
            prompt: {
                freeText: async (params, onChunkStream, controller = undefined) => {
                    return aiFetch('Prompt\\FreeText', params, onChunkStream, controller);
                },
                text: async (params, onChunkStream, controller = undefined) => {
                    return aiFetch('Prompt\\Text', params, onChunkStream, controller);
                },
                vision: async (params, onChunkStream, controller = undefined) => {
                    return aiFetch('Prompt\\Vision', params, onChunkStream, controller);
                },
                image: async (params, controller = undefined) => {
                    return aiFetch('Prompt\\Image', params, undefined, controller);
                }
            }
        }
    }
})();
