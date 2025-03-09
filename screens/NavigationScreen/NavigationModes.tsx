import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationMode } from '@/types/navigation';

interface NavigationModesProps {
    mode: NavigationMode;
    onModeChange: (mode: NavigationMode) => void;
}

interface ModeOption {
    id: NavigationMode;
    label: string;
}

export const NavigationModes: React.FC<NavigationModesProps> = ({ mode, onModeChange }) => {
    const modes: ModeOption[] = [
        { id: 'DRIVING', label: '驾车' },
        { id: 'WALKING', label: '步行' },
        { id: 'BICYCLING', label: '骑行' },
        { id: 'TRANSIT', label: '公交' },
    ];

    return (
        <View style={styles.container}>
            {modes.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.modeButton,
                        mode === item.id && styles.selectedMode,
                    ]}
                    onPress={() => onModeChange(item.id)}
                >
                    <Text style={[
                        styles.modeText,
                        mode === item.id && styles.selectedModeText,
                    ]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modeButton: {
        padding: 8,
        borderRadius: 5,
    },
    selectedMode: {
        backgroundColor: '#4A89F3',
    },
    modeText: {
        color: '#666',
    },
    selectedModeText: {
        color: 'white',
    },
});
