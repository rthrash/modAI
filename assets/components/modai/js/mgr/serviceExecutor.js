modAI.serviceExecutor = async (details) => {
    if (!details.forExecutor) {
        return details;
    }

    const executorDetails = details.forExecutor;

    const callService = async (details) => {
        const res = await fetch(details.url, {
            method: 'POST',
            body: details.body,
            headers: details.headers
        });

        if (!res.ok) {
            const data = await res.json();
            if (data?.error) {
                throw new Error(data.error.message);
            }

            throw new Error(`${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data;
    }

    const services = {
        chatgpt: {
            content: (data) => {
                const content = data?.choices?.[0]?.message?.content;

                if (!content) {
                    throw new Error(_('modai.cmp.failed_request'));
                }

                return {
                    content
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

                return {
                    content
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
                    content
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
    };

    if (!executorDetails.service || !executorDetails.parser) {
        throw new Error(_('modai.cmp.service_required'));
    }

    if (!services[executorDetails.service]?.[executorDetails.parser]) {
        throw new Error(_('modai.cmp.service_unsupported'));
    }

    const data = await callService(executorDetails);

    return services[executorDetails.service][executorDetails.parser](data);
}
