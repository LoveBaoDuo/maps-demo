import React from 'react';
import {Button, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@/types/navigation';
import {router} from "expo-router";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface NavigateButtonProps {
    destination: {
        latitude: number;
        longitude: number;
        title?: string;
    };
    buttonTitle?: string;
}

export const NavigateButton: React.FC<NavigateButtonProps> = ({
                                                                  destination,
                                                                  buttonTitle = '导航'
                                                              }) => {
    const navigation = useNavigation<NavigationProp>();
    const handlePress = () => {
        router.push({
            pathname: "/(router)/navigationView",
            params: {destination: JSON.stringify(destination)},
        } as any);
    };
    return (
        <Button
            title={buttonTitle}
            onPress={handlePress}
        />
    );
};

export default NavigateButton;
