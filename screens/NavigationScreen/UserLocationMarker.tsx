import React, {useState, useEffect} from 'react';
import * as Location from 'expo-location';
import {View, StyleSheet} from 'react-native';
import {Marker} from "react-native-maps";
import {Coordinates} from "@/types/navigation";

const UserLocationMarker = ({currentLocation}: { currentLocation: Coordinates }) => {
    const [heading, setHeading] = useState(0);

    useEffect(() => {
        let subscription;

        const startHeadingUpdates = async () => {
            try {
                // 请求位置权限
                const {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('位置权限被拒绝');
                    return;
                }

                // 开始监听设备朝向
                subscription = await Location.watchHeadingAsync((headingData) => {
                    // headingData.magHeading 是相对于磁北的角度
                    // headingData.trueHeading 是相对于真北的角度（如果可用）
                    setHeading(headingData.trueHeading || headingData.magHeading);
                });
            } catch (error) {
                console.error('获取设备方向失败:', error);
            }
        };

        startHeadingUpdates();

        // 清理函数
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return (
        <Marker
            coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            }}
            rotation={heading}
            anchor={{x: 0.5, y: 0.5}}
        >
            <View style={styles.directionMarker}>
                {/* 半透明背景圆圈 */}
                <View style={styles.circleBackground}/>
                {/* 导航箭头和位置点的容器 */}
                <View style={styles.markerContent}>
                    {/* 导航箭头 - 向上偏移 */}
                    <View style={styles.arrow}/>
                </View>
                {/* 位置点 */}
                <View style={styles.dot}/>
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    directionMarker: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerContent: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'space-between', // 使用空间分布
        paddingVertical: 4, // 增加上下内边距
    },
    arrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#2196F3',
        transform: [{translateY: -4}], // 向上偏移
    },
    dot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2196F3',
        borderWidth: 2,
        borderColor: 'white',
    },
    // 半透明背景圆圈
    circleBackground: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(33, 150, 243, 0.1)', // 淡蓝色半透明背景
        borderWidth: 2,
        borderColor: 'rgba(33, 150, 243, 0.3)', // 稍深一点的边框颜色
    },
});
export default UserLocationMarker;
