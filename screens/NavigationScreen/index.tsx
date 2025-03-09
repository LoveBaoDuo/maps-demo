import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Button, Text, Alert, Platform, Switch} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationModes} from './NavigationModes';
import {SettingsPanel} from './SettingsPanel';
import {
    Coordinates,
    NavigationProps,
    NavigationSettings,
    NavigationMode,
    RouteInfo
} from '@/types/navigation';
import {checkLocationPermission, checkLocationServices} from "@/utils/permissions";
import {NavigationPanel} from "@/screens/NavigationScreen/NavigationPanel";
import {findNearestStep} from "@/utils/navigationUtils";
import {decode} from 'html-entities'; // 处理 HTML 实体

const NavigationScreen: React.FC<NavigationProps> = ({destination}) => {
    const mapRef = useRef<MapView | null>(null);
    const [origin, setOrigin] = useState<Coordinates | null>(null);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo>({
        destination: '',
        duration: '',
        distance: '',
        steps: [],
        nextInstruction: '',
        currentStepIndex: 0
    });
    const [hasPermission, setHasPermission] = useState(true);
    const [navigationMode, setNavigationMode] = useState<NavigationMode>('DRIVING');
    const [settings, setSettings] = useState<NavigationSettings>({
        voiceEnabled: true,
        showTraffic: true,
        batteryOptimization: true,
        navigationMode: 'DRIVING'
    });
    const [offlineMode, setOfflineMode] = useState<boolean>(false);
    const [lastVoiceInstruction, setLastVoiceInstruction] = useState<string>('');

    // 加载用户设置
    useEffect(() => {
        loadSettings();
    }, []);

    const saveSettings = async (): Promise<void> => {
        try {
            await AsyncStorage.setItem('navigationSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    };

    const loadSettings = async (): Promise<void> => {
        try {
            const savedSettings = await AsyncStorage.getItem('navigationSettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    };

    const getLocationUpdateConfig = async (): Promise<Location.LocationOptions> => {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const isCharging = await Battery.isChargingAsync();
        if (!settings.batteryOptimization || isCharging || batteryLevel > 0.2) {
            return {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 10,
            };
        } else {
            return {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 3000,
                distanceInterval: 30,
            };
        }
    };
    useEffect(() => {
        const checkPermissions = async () => {

            // 首先检查定位服务是否开启
            const servicesEnabled = await checkLocationServices();
            if (!servicesEnabled) {
                return;
            }

            // 然后检查权限
            const permissionGranted = await checkLocationPermission();
            setHasPermission(permissionGranted);
        };

        checkPermissions();
    }, []);
    const config = {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000,
    }
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const startLocationUpdates = async () => {

            if (!hasPermission) {
                Alert.alert('错误', '无法获取位置权限');
                return;
            }
            // const config = await getLocationUpdateConfig();

            const initialLocation = await Location.getCurrentPositionAsync(config);
            const coords: Coordinates = {
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude,
            };

            setOrigin(coords);
            setCurrentLocation(coords);

            locationSubscription = await Location.watchPositionAsync(
                config,
                (location) => {
                    const newCoords: Coordinates = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                    setCurrentLocation(newCoords);
                    // 找到最近的步骤
                    const nearestIndex = findNearestStep(newCoords, routeInfo.steps);

                    updateCurrentStep(nearestIndex);
                    // 可以添加提示逻辑
                    if (nearestIndex !== routeInfo.currentStepIndex) {
                        // 播放语音提示或显示提示信息
                        speakInstruction(routeInfo.steps[nearestIndex].instruction);
                    }
                    if (isNavigating) {
                        updateNavigationInfo(newCoords);
                    }
                }
            );
        };

        startLocationUpdates();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isNavigating, settings.batteryOptimization]);

    const speakInstruction = async (instruction: string): Promise<void> => {
        if (settings?.voiceEnabled && instruction !== lastVoiceInstruction) {
            try {
                await Speech.speak(instruction, {
                    language: 'zh-CN',
                    pitch: 1,
                    rate: 0.8,
                });
                setLastVoiceInstruction(instruction);
            } catch (error) {
                console.error('语音播报失败:', error);
            }
        }
    };

    const updateNavigationInfo = async (currentCoords: Coordinates): Promise<void> => {
        if (!destination || offlineMode) return;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${currentCoords.latitude},${currentCoords.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${navigationMode.toLowerCase()}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
            );
            const result = await response.json();

            if (result.routes.length > 0) {
                const route = result.routes[0].legs[0];
                const nextInstruction = route.steps[0].html_instructions;

                setRouteInfo((prev) => ({
                    ...prev,
                    distance: route.distance.text,
                    duration: route.duration.text,
                    nextInstruction: nextInstruction
                }))
                speakInstruction(nextInstruction.replace(/<[^>]*>/g, ''));
            }
        } catch (error) {
            console.error('更新导航信息失败:', error);
            if (!offlineMode) {
                setOfflineMode(true);
                Alert.alert('网络错误', '已切换至离线模式');
            }
        }
    };

    const startNavigation = async (): Promise<void> => {
        if (!currentLocation) return;
        setIsNavigating(true);
        if (mapRef.current) {
            const camera = {
                center: currentLocation,
                pitch: 45,
                heading: 0,
                zoom: 18,
            };
            mapRef.current?.animateCamera(camera);
        }
        speakInstruction('导航开始');
    };

    const stopNavigation = (): void => {
        setIsNavigating(false);
        // setRouteInfo((prev) => ({
        //     ...prev,
        //     distance: '',
        //     duration: '',
        //     nextInstruction: ''
        // }));
        Speech.stop();
    };
// 更新当前步骤的函数
    const updateCurrentStep = (newIndex: number) => {
        setRouteInfo(prev => ({
            ...prev,
            currentStepIndex: newIndex
        }) as RouteInfo);
    };


    // 监听位置变化
    const handleSettingChange = (key: keyof NavigationSettings, value: boolean | NavigationMode): void => {
        setSettings(prev => {
            const newSettings = {...prev, [key]: value};
            AsyncStorage.setItem('navigationSettings', JSON.stringify(newSettings));
            return newSettings;
        });
        if (key === 'navigationMode') {
            setNavigationMode(value as NavigationMode);
        }
    };
    // 处理 HTML 指令文本
    const parseHtmlInstructions = (htmlInstructions: string): string => {
        // 1. 移除 HTML 标签
        const withoutTags = htmlInstructions.replace(/<[^>]*>/g, ' ');
        // 2. 解码 HTML 实体
        const decodedText = decode(withoutTags);
        // 3. 清理多余空格
        return decodedText.replace(/\s+/g, ' ').trim();
    };
    // 转换导航指令为中文
    const getChineseInstruction = (maneuver: string | undefined, instruction: string): string => {
        const maneuverMap: { [key: string]: string } = {
            'turn-left': '左转',
            'turn-right': '右转',
            'turn-slight-left': '稍向左转',
            'turn-slight-right': '稍向右转',
            'turn-sharp-left': '向左急转',
            'turn-sharp-right': '向右急转',
            'uturn-left': '左转掉头',
            'uturn-right': '右转掉头',
            'straight': '直行',
            'merge': '并线',
            'ramp-left': '左侧匝道',
            'ramp-right': '右侧匝道',
            'fork-left': '左叉',
            'fork-right': '右叉',
            'roundabout-left': '环岛左转',
            'roundabout-right': '环岛右转'
        };

        const baseInstruction = maneuver ? maneuverMap[maneuver] || maneuver : '直行';
        const parsedInstruction = parseHtmlInstructions(instruction);

        // 如果有道路名称，添加到指令中
        const match = parsedInstruction.match(/toward (.+?)(?:Restricted|$)/);
        const roadName = match ? match[1].trim() : '';

        return roadName ? `${baseInstruction}，前往${roadName}` : baseInstruction;
    };
    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${meters.toFixed(0)}米`;
        }
        return `${(meters / 1000).toFixed(1)}公里`;
    };
    return (
        <View style={styles.container}>
            {currentLocation && (
                <>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        followsUserLocation={isNavigating}
                        showsTraffic={settings.showTraffic}
                        initialRegion={{
                            ...currentLocation,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {destination && (
                            <>
                                <Marker coordinate={destination} title="目的地"/>
                                <MapViewDirections
                                    origin={currentLocation}
                                    destination={destination}
                                    apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
                                    strokeWidth={3}
                                    strokeColor="#4A89F3"
                                    mode={navigationMode}
                                    onReady={result => {
                                        // 处理路线步骤信息
                                        const steps = result.legs[0].steps.map(step => {
                                            return ({
                                                start_location: step.start_location,
                                                end_location: step.end_location,
                                                distance: formatDistance(step.distance.value),
                                                maneuver: step.maneuver,
                                                instruction: getChineseInstruction(step.maneuver, step.html_instructions),
                                            })
                                        });
                                        setRouteInfo((prev) => ({
                                            ...prev,
                                            destination: result.legs[0].end_address,
                                            duration: `${Math.ceil(result.duration)}分钟`,
                                            distance: formatDistance(result.distance * 1000),
                                            steps: steps,
                                            nextInstruction: steps[0]?.instruction || ''
                                        }) as RouteInfo);
                                    }}
                                />
                            </>
                        )}
                    </MapView>

                    <NavigationModes
                        mode={navigationMode}
                        onModeChange={(mode) => handleSettingChange('navigationMode', mode)}
                    />

                    <SettingsPanel
                        settings={settings}
                        onSettingChange={handleSettingChange}
                    />

                    <NavigationPanel
                        isNavigating={isNavigating}
                        routeInfo={routeInfo}
                        onStart={startNavigation}
                        onStop={stopNavigation}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default NavigationScreen;
