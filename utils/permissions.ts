import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export const checkLocationPermission = async (): Promise<boolean> => {
    try {
        // 检查当前权限状态
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        // 如果已经授权，直接返回 true
        if (existingStatus === 'granted') {
            return true;
        }

        // 请求权限
        const { status } = await Location.requestForegroundPermissionsAsync();

        // 如果用户拒绝了权限
        if (status !== 'granted') {
            Alert.alert(
                '需要位置权限',
                '此功能需要位置权限才能使用。请在设置中开启位置权限。',
                [
                    { text: '取消', style: 'cancel' },
                    {
                        text: '去设置',
                        onPress: () => {
                            // 打开应用设置页面
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
            return false;
        }

        // 如果需要后台定位权限
        if (Platform.OS === 'android') {
            const { status: backgroundStatus } =
                await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus !== 'granted') {
                Alert.alert(
                    '需要后台位置权限',
                    '为了提供更好的导航体验，请允许后台定位权限',
                    [
                        { text: '取消', style: 'cancel' },
                        {
                            text: '去设置',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
            }
        }

        return true;
    } catch (error) {
        console.error('权限请求失败:', error);
        return false;
    }
};

// 检查是否启用了定位服务
export const checkLocationServices = async (): Promise<boolean> => {
    try {
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
            Alert.alert(
                '定位服务未开启',
                '请在系统设置中开启定位服务',
                [
                    { text: '取消', style: 'cancel' },
                    {
                        text: '去设置',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('App-Prefs:Privacy&path=LOCATION');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('检查定位服务失败:', error);
        return false;
    }
};
