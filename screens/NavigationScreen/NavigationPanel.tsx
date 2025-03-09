import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import {RouteInfo} from "@/types/navigation";
import ScrollView = Animated.ScrollView;
import {IconSymbol, IconSymbolName} from "@/components/ui/IconSymbol";


interface NavigationPanelProps {
    isNavigating: boolean;
    routeInfo: RouteInfo;
    onStart: () => void;
    onStop: () => void;
}


export const NavigationPanel: React.FC<NavigationPanelProps> = ({
                                                                    isNavigating,
                                                                    routeInfo,
                                                                    onStart,
                                                                    onStop,
                                                                }) => {
    const scrollViewRef = useRef<ScrollView>({} as any);

    // 当前步骤改变时，滚动到对应位置
    useEffect(() => {
        if (scrollViewRef.current && routeInfo.steps.length > 0) {
            scrollViewRef.current.scrollTo({
                y: routeInfo.currentStepIndex * 80, // 根据实际步骤项高度调整
                animated: true
            });
        }
    }, [routeInfo.currentStepIndex]);

    // 获取步骤对应的图标
    const getStepIcon = (maneuver?: string): any => {
        switch (maneuver) {
            case 'turn-right':
                return 'maps.right';
            case 'turn-left':
                return 'maps.left';
            case 'turn-slight-right':
                return 'maps.subdirectory.arrow.right';
            case 'turn-slight-left':
                return 'maps.subdirectory.arrow.left';
            case 'uturn-right':
            case 'uturn-left':
                return 'maps.u-turn-left';
            case 'ramp-left':
                return 'maps.ramp.left';
            case 'ramp-right':
                return 'maps.ramp.right';
            default:
                return 'maps.straight';
        }
    };

    return (
        <View style={styles.container}>
            {/* 当前步骤显示在顶部 */}
            {routeInfo.steps?.length > 0 && (
                <View style={styles.currentStep}>
                    <IconSymbol
                        name={getStepIcon(routeInfo.steps[routeInfo.currentStepIndex]?.maneuver)}
                        size={24}
                        color="#4CAF50"
                    />
                    <View style={styles.currentStepInfo}>
                        <Text style={styles.currentStepText}>
                            {routeInfo.steps[routeInfo.currentStepIndex]?.instruction}
                        </Text>
                        <Text style={styles.currentStepDistance}>
                            {routeInfo.steps[routeInfo.currentStepIndex]?.distance}
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.routeInfo}>
                <Text style={styles.title}>目的地: {routeInfo.destination}</Text>
                <View style={styles.details}>
                    <Text style={styles.detailText}>预计时间: {routeInfo.duration}</Text>
                    <Text style={styles.detailText}>距离: {routeInfo.distance}</Text>
                </View>
            </View>

            {
                !isNavigating && <ScrollView
                    ref={scrollViewRef}
                    style={styles.stepsContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {routeInfo.steps?.map((step, index) => (
                        <View
                            key={index}
                            style={[
                                styles.stepItem,
                                index === routeInfo.currentStepIndex && styles.activeStep
                            ]}
                        >
                            <IconSymbol
                                name={getStepIcon(step.maneuver)}
                                size={20}
                                weight="medium"
                                color={index === routeInfo.currentStepIndex ? "#4CAF50" : "#666"}
                            />
                            <View style={styles.stepInfo}>
                                <Text style={[
                                    styles.stepText,
                                    index === routeInfo.currentStepIndex && styles.activeStepText
                                ]}>
                                    {step.instruction}
                                </Text>
                                <Text style={styles.stepDistance}>{step.distance}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            }

            <View style={styles.controls}>
                {!isNavigating ? (
                    <TouchableOpacity
                        style={[styles.button, styles.startButton]}
                        onPress={onStart}
                    >
                        <Text style={styles.buttonText}>开始导航</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.stopButton]}
                        onPress={onStop}
                    >
                        <Text style={styles.buttonText}>结束导航</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },

    currentStep: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: 16,
    },

    currentStepInfo: {
        flex: 1,
        marginLeft: 12,
    },

    currentStepText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },

    currentStepDistance: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },

    routeInfo: {
        marginBottom: 16,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },

    details: {
        flexDirection: 'row',
        gap: 16,
    },

    detailText: {
        color: '#666',
    },

    stepsContainer: {
        maxHeight: 300,
        marginBottom: 16,
    },

    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    stepInfo: {
        flex: 1,
        marginLeft: 12,
    },

    stepText: {
        fontSize: 14,
        color: '#333',
    },

    stepDistance: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },

    activeStep: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
    },

    activeStepText: {
        color: '#4CAF50',
        fontWeight: '600',
    },

    controls: {
        alignItems: 'center',
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 4,
    },

    startButton: {
        backgroundColor: '#4CAF50',
    },

    stopButton: {
        backgroundColor: '#f44336',
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
