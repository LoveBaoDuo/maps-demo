// 创建 proxy.js 文件
const PROXY_DOMAINS = [
    'maps.googleapis.com',
    'maps.gstatic.com',
    'google.com',
    'googleapis.com'
];

// 修改代理服务器地址为主机 IP
const PROXY_SERVER = 'http://192.168.100.9:7890'; // 替换为你的主机 IP
const LOCAL_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '10.0.2.2',
    'exp.host',           // Expo 域名
    'expo.dev',
    'expo.io',
    '192.168.',          // 本地网络 IP
    'metro'              // Metro bundler
];

export function setupProxy() {
    console.log('开始设置代理');  // 调试日志

    if (__DEV__) {
        console.log('开发环境确认');  // 调试日志

        // 处理 XMLHttpRequest
        const originalXHR = global.XMLHttpRequest;
        console.log('原始 XMLHttpRequest 获取成功');  // 调试日志

        global.XMLHttpRequest = function() {
            console.log('创建新的 XMLHttpRequest');  // 调试日志
            const xhr = new originalXHR();
            const originalOpen = xhr.open;

            xhr.open = function(...args) {
                const url = args[1];
                console.log('请求 URL:', url);  // 调试日志

                // 检查是否为本地/Expo 相关连接
                const isLocalConnection = LOCAL_DOMAINS.some(domain => url.includes(domain));
                if (isLocalConnection) {
                    console.log('本地连接，不使用代理:', url);
                    return originalOpen.apply(xhr, args);
                }

                // 检查是否需要代理
                const shouldUseProxy = PROXY_DOMAINS.some(domain => url.includes(domain));
                if (shouldUseProxy) {
                    console.log('使用代理:', `${PROXY_SERVER}/${url}`);  // 调试日志
                    args[1] = `${PROXY_SERVER}/${url}`;
                }

                return originalOpen.apply(xhr, args);
            };

            return xhr;
        };

        // 处理 fetch
        const originalFetch = global.fetch;
        global.fetch = function(url, options = {}) {
            console.log('Fetch 请求:', url);

            // 检查是否为本地连接
            const isLocalConnection = LOCAL_DOMAINS.some(domain => url.includes(domain));
            if (isLocalConnection) {
                console.log('本地 fetch，不使用代理:', url);
                return originalFetch(url, options);
            }

            // 检查是否需要代理
            const shouldUseProxy = PROXY_DOMAINS.some(domain => url.includes(domain));
            if (shouldUseProxy) {
                // 确保 URL 是一个字符串并正确编码
                const urlString = url.toString();
                const cleanUrl = urlString.replace(/^@/, '');

                // 构建新的代理 URL
                const proxiedUrl = new URL(cleanUrl);
                const finalUrl = `${PROXY_SERVER}${proxiedUrl.pathname}${proxiedUrl.search}`;
                console.log('使用代理 fetch:', finalUrl);

                // 添加必要的请求头
                const newOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                };

                return originalFetch(finalUrl, newOptions);
            }

            return originalFetch(url, options);
        };
    }
}
