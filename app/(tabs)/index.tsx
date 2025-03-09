import {Image, StyleSheet, Platform, Button, View} from 'react-native';

import {HelloWave} from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Link} from "expo-router";
import {ColorSpace} from "react-native-reanimated";
import {Colors} from "@/constants/Colors";
import WebViewWindows from "react-native-webview/src/WebView.windows";
import NavigateButton from "@/components/NavigateButton";

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <View style={styles.container}>
                <Link href="/(router)/maps">Go to home screen</Link>
            </View>
            <NavigateButton destination={{
                latitude: 37.32990133511175,
                longitude: -121.90161059808545,
                title: '圣荷西'
            }}
                            buttonTitle="导航到圣荷西"/>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    container: {
        backgroundColor: 'blur',
        borderWidth: 1,
        height: 30,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
