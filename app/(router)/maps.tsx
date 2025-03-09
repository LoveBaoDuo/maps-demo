import HomeScreen from "@/app/(tabs)";
import {View, Text, KeyboardAvoidingView, Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MapView, {Marker, Polyline} from "react-native-maps";
import MapViewDirections from 'react-native-maps-directions';
import {useEffect, useState} from "react";
import * as Location from 'expo-location';

export default function MapsScreen() {
    const insets = useSafeAreaInsets();
    // 目标坐标
    const [region, setRegion] = useState({
        latitude: 37.78855,
        longitude: -122.4344,
    })
    // 原始坐标
    const [origin, setOrigin] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
    });
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    useEffect(() => {
        (async () => {
            // 获取位置权限
            const {status} = await Location.requestForegroundPermissionsAsync();
            console.log(status,status)
            if (status !== 'granted') {
                console.error('位置权限被拒绝');
                return;
            }
            // 获取当前位置
            const location = await Location.getCurrentPositionAsync({});
            setOrigin({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            } as any);
        })();
    }, [origin]);
    return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={{paddingTop: insets.top, flex: 1, width: '100%', height: '100%'}}>
            <MapView style={{flex: 1}}  initialRegion={{
                latitude: origin.latitude,
                longitude: origin.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
                     onError={(error) => console.error('Map loading error:', error)}>
                {/* 起点标记 */}
                <Marker coordinate={origin} title="当前位置" />

                {/* 终点标记 */}
                {region && (
                    <Marker coordinate={region} title="目的地" />
                )}

                {/* 使用 MapViewDirections 绘制路线 */}
                {region && (
                    <MapViewDirections
                        origin={origin}
                        destination={region}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
                        strokeWidth={3}
                        strokeColor="#4A89F3"
                        mode="DRIVING" // 可选：DRIVING, WALKING, BICYCLING, TRANSIT
                        language="zh-CN"
                        onStart={(params) => {
                            console.log(`开始路线规划: ${JSON.stringify(params)}`);
                        }}
                        onReady={result => {
                            console.log(`距离: ${result.distance} km`);
                            console.log(`时间: ${result.duration} min`);
                        }}
                        onError={(errorMessage) => {
                            console.error('路线规划错误:', errorMessage);
                        }}
                    />
                )}
            </MapView>
        </View>
    </KeyboardAvoidingView>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'space-around',
    },
    header: {
        fontSize: 36,
        marginBottom: 48,
    },
    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
    },
    btnContainer: {
        backgroundColor: 'white',
        marginTop: 12,
    },
});
