export const useWebSocket = (_url: string, _options?: any) => {
    return {
        sendMessage: (msg: any) => console.log('WS Send:', msg),
        lastMessage: null,
        readyState: 1 // Open
    };
};
