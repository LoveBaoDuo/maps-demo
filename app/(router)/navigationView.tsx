import NavigationScreen from '@/screens/NavigationScreen';
import {useRoute} from "@react-navigation/core";
import {RootStackParamList} from "@/types/navigation";
import {RouteProp} from "@react-navigation/native";
type RouteProps = RouteProp<RootStackParamList, 'Navigation'>;
export default function NavigationView() {
    const route = useRoute<RouteProps>();
    // 获取路由参数
    const {destination} = route.params;
    return (
        <NavigationScreen destination={JSON.parse(destination)}/>
    );
};
