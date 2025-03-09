export type RootStackParamList = {
    Home: undefined;
    Navigation: {
        destination: {
            latitude: number;
            longitude: number;
            title?: string;
        };
    };
};

export interface Coordinates {
    latitude: number;
    longitude: number;
    heading?: any;
}

export interface NavigationSettings {
    voiceEnabled: boolean;
    showTraffic: boolean;
    batteryOptimization: boolean;
    navigationMode: NavigationMode;
}

export type NavigationMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

export interface RouteInfo {
    distance: string;
    duration: string;
    nextInstruction: string;
}

export interface NavigationProps {
    destination: Coordinates;
}
