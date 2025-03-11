export const styles = {
    resetStyles: {
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif'
    },
    modalOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'none',
        zIndex: '100'
    },
    chatModal: {
        position: 'fixed',
        width: '1000px',
        minHeight: '170px',
        maxHeight: '600px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        display: 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: '101',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'height 0.3s ease-in-out'
    },
    chatHeader: {
        backgroundColor: '#00B6DE',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'move'
    },
    chatTitle: {
        fontWeight: 'bold',
        fontSize: '16px'
    },
    chatControls: {
        display: 'flex',
        gap: '10px'
    },
    controlButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer'
    },
    chatMessages: {
        flex: '1',
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9',
        width: '100%',
        boxSizing: 'border-box',
        display: 'none'
    },
    message: {
        marginBottom: '20px',
        borderRadius: '8px',
        position: 'relative',
        wordWrap: 'break-word',
        width: '100%',
        boxSizing: 'border-box'
    },
    aiMessage: {
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
    },
    userMessage: {
        width: 'fit-content',
        padding: '10px 15px',
        backgroundColor: '#4299e1',
        color: 'white',
        marginLeft: 'auto',
        borderBottomRightRadius: '5px'
    },
    messageContent: {
        padding: '12px',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    messageActions: {
        display: 'flex',
        padding: '8px 12px',
        gap: '8px',
        backgroundColor: '#f7fafc',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0 0 8px 8px'
    },
    actionButton: {
        backgroundColor: '#edf2f7',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#4a5568'
    },
    chatInput: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'white',
        position: 'relative'
    },
    inputRow: {
        display: 'flex',
        width: '100%',
        gap: '10px'
    },
    inputWrapper: {
        flex: '1',
        position: 'relative',
        minHeight: '48px',
        maxHeight: '150px',
        display: 'flex'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        outline: 'none',
        fontSize: '14px',
        resize: 'none',
        minHeight: '48px',
        maxHeight: '150px',
        overflowY: 'auto',
        backgroundColor: '#fff',
        cursor: 'inherit'
    },
    buttonsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100px'
    },
    sendButton: {
        backgroundColor: '#6CB24A',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        height: '40px',
        minWidth: '100px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        opacity: '1',
    },
    actionButtonsRow: {
        display: 'flex',
        gap: '4px',
        justifyContent: 'space-between'
    },
    iconButton: {
        backgroundColor: 'transparent',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        width: '48px',
        height: '32px',
        padding: '0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        opacity: '1',
    },
    sendIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    stopIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23DC2626\'%3E%3Cpath d=\'M0 0h24v24H0z\' fill=\'none\'/%3E%3Cpath d=\'M6 6h12v12H6z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    refreshIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%234B5563\'%3E%3Cpath d=\'M0 0h24v24H0z\' fill=\'none\'/%3E%3Cpath d=\'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    icon: {
        display: 'inline-block',
        width: '14px',
        height: '14px',
        marginRight: '5px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    disabledButton: {
        opacity: '0.5',
        cursor: 'not-allowed'
    },
    loadingInput: {
        backgroundColor: '#f3f4f6',
        cursor: 'not-allowed'
    },
    loadingIndicator: {
        display: 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(243, 244, 246, 0.9)',
        borderRadius: '10px',
        color: '#6B7280',
        fontSize: '14px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flexDirection: 'row',
        zIndex: '10',
        backdropFilter: 'blur(2px)',
        border: '1px solid #e2e8f0',
        pointerEvents: 'none'
    },
    loadingDot: {
        width: '6px',
        height: '6px',
        backgroundColor: '#9CA3AF',
        borderRadius: '50%',
        animation: 'loadingDotPulse 1.4s infinite',
        display: 'inline-block'
    },
    typeSelector: {
        padding: '5px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'white'
    },
    typeLabel: {
        fontSize: '14px',
        color: '#4B5563',
        fontWeight: '500'
    },
    typeToggleGroup: {
        display: 'flex',
        gap: '4px'
    },
    typeToggleButton: {
        padding: '6px 12px',
        fontSize: '13px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        backgroundColor: '#fff',
        color: '#4B5563',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: '1',
    },
    typeToggleButtonActive: {
        backgroundColor: '#00B6DE',
        color: '#fff',
        borderColor: '#00B6DE'
    },
    errorMessage: {
        width: 'fit-content',
        padding: '10px 15px',
        backgroundColor: '#DC2626',
        color: 'white',
        marginLeft: 'auto',
        borderBottomRightRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    errorIcon: {
        width: '16px',
        height: '16px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'white\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\'/%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    },
    imagePreview: {
        position: 'absolute',
        top: '5px',
        left: '5px',
        width: '71px',
        height: '71px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
    },
    imagePreviewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imagePreviewRemove: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        cursor: 'pointer',
        opacity: '0',
        transition: 'opacity 0.2s ease',
    },
} satisfies Record<string, Partial<CSSStyleDeclaration>>;
