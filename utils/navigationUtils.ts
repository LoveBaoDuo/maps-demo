interface Position {
    latitude: number;
    longitude: number;
}

interface Step {
    distance: string;
    instruction: string;
    maneuver?: string;
    start_location: Position; // 每个步骤的位置坐标
}

// 计算两点之间的距离（使用 Haversine 公式）
const calculateDistance = (point1: Position, point2: Position): number => {
    const R = 6371e3; // 地球半径（米）
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 返回米数
};

// 找到最近的导航步骤
export const findNearestStep = (currentPosition: Position, steps: Step[]): number => {
    let nearestIndex = 0;
    let minDistance = Infinity;

    steps.forEach((step, index) => {
        const distance = calculateDistance(currentPosition, step.start_location);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
        }
    });

    return nearestIndex;
};
