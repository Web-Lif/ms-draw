
import Konva from 'konva'
import { Direction } from '../types'

export const getConnectPoint = (shapeRef: Konva.Node, type: string): {x: number, y: number}[] => {
    if (type === 'Circle' && shapeRef ) {
        const {x, y } = shapeRef.getPosition()
        const { width, height } = shapeRef.getSize()
        const { x: scaleX, y: scaleY} = shapeRef.scale()
        const rWidth = width * scaleX;
        const rHeight = height * scaleY;
        return [
            // 上
            { x: x + rWidth / 2,  y },
            // 右
            { x: x + rWidth,  y: y + rHeight / 2 },
            // 下
            { x: x + rHeight / 2, y: y + rHeight},
            // 左
            { x, y : y + rHeight / 2 },
        ]
    }
    return []
}