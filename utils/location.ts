import * as Location from 'expo-location';
import {Alert} from 'react-native';

// 位置配置类型
interface LocationConfig {
    accuracy: Location.Accuracy;
    timeInterval: number;
    distanceInterval: number;
    timeout?: number;
}

// 获取位置配置
export const getLocationUpdateConfig = async (): Promise<LocationConfig> => {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    const isCharging = await Battery.isChargingAsync();

    if (!batteryOptimization || isCharging || batteryLevel > 0.2) {
        return {
            accuracy: Location.Accuracy.Balanced, // 降低精度以提高响应速度
            timeInterval: 1000,
            distanceInterval: 10,
            timeout: 10000, // 10秒超时
        };
    } else {
        return {
            accuracy: Location.Accuracy.Low, // 低电量时使用低精度
            timeInterval: 3000,
            distanceInterval: 30,
            timeout: 15000, // 15秒超时
        };
    }
};

// 带超时的位置获取
export const getCurrentLocationWithTimeout = async (timeout: number = 10000) => {
    return Promise.race([
        Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('获取位置超时')), timeout)
        ),
    ]);
};

// 位置监听器
export const startLocationUpdatesListen = async (
    onLocationUpdate: (location: Location.LocationObject) => void,
    onError: (error: any) => void
) => {
    try {
        // 先尝试获取一次当前位置
        const initialLocation = await getCurrentLocationWithTimeout();
        onLocationUpdate(initialLocation);

        // 开始持续监听位置
        const config = await getLocationUpdateConfig();
        const subscription = await Location.watchPositionAsync(
            {
                accuracy: config.accuracy,
                timeInterval: config.timeInterval,
                distanceInterval: config.distanceInterval,
            } as any,
            (location) => {
                onLocationUpdate(location);
            }
        );

        return subscription;
    } catch (error) {
        onError(error);
        return null;
    }
};
