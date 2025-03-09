import React, { createContext, useContext, useState } from 'react';
import { FancyLoading } from './Loading';

const LoadingContext = createContext({
    showLoading: (text?: string) => {},
    hideLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const showLoading = (text = '加载中...') => {
        setLoadingText(text);
        setVisible(true);
    };

    const hideLoading = () => {
        setVisible(false);
    };

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {children}
            {visible && <FancyLoading text={loadingText} />}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
