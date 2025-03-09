import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { NavigationSettings } from '@/types/navigation';

interface SettingsPanelProps {
    settings: NavigationSettings;
    onSettingChange: (key: keyof NavigationSettings, value: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingChange }) => {
    return (
        <View style={styles.container}>
            <View style={styles.settingRow}>
                <Text>语音导航</Text>
                <Switch
                    value={settings.voiceEnabled}
                    onValueChange={(value) => onSettingChange('voiceEnabled', value)}
                />
            </View>
            <View style={styles.settingRow}>
                <Text>显示路况</Text>
                <Switch
                    value={settings.showTraffic}
                    onValueChange={(value) => onSettingChange('showTraffic', value)}
                />
            </View>
            <View style={styles.settingRow}>
                <Text>省电模式</Text>
                <Switch
                    value={settings.batteryOptimization}
                    onValueChange={(value) => onSettingChange('batteryOptimization', value)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 80,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
});
