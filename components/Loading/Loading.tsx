import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const FancyLoading = ({ text = '加载中...' }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.gradient}
            >
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.text}>{text}</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBox: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
    },
    text: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
});
