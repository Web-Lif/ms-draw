import React, { cloneElement, useRef, useEffect, useState } from 'react'
import { Transformer, Circle, Group} from 'react-konva'
import Konva from 'konva'
import shortid from 'shortid'

interface Shape {
    selectd: string
    hover: string
    setSelectd: (selectd: string) => void
    addHistory: (stage: Konva.Stage) => void
    shape: JSX.Element
}

const useShape = ({
    shape,
    hover,
    selectd,
    setSelectd,
    addHistory
}: Shape) => {
    const shapeProps = shape.props

    const shapeRef = useRef<Konva.Shape>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const id = useRef<string>(shapeProps.id || shortid.generate())


    const transformer = (
        <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
                // 限制最小的缩放
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            onTransformEnd={(e) => {
                addHistory(e.target.getStage()!)
            }}
        />
    )

    const [draggable, setDraggable] = useState<boolean>(true)

    useEffect(() => {
        if (selectd) {
          transformerRef.current?.nodes([shapeRef.current!]);
          transformerRef.current?.getLayer()?.batchDraw();
        }
    }, [selectd]);


    // 渲染连接点的位置
    const renderConnectPoint = () => {
        if (shape.type === 'Circle' && shapeRef.current &&  hover === id.current) {
            const {x, y } = shapeRef.current.getPosition()
            const { width, height } = shapeRef.current.getSize()
            const { x: scaleX, y: scaleY} = shapeRef.current.scale()
            return [
                // 上
                { x, y: y - height / 2 * scaleY },
                // 右
                { x: x + width / 2 * scaleX, y },
                // 下
                { x, y: y + height / 2 * scaleY },
                // 左
                { x: x - width / 2 * scaleX, y },
            ]
        }
        return []
    }

    return (
        <Group
            name={id.current}
            draggable={draggable}
            onDragEnd={(e) => {
                addHistory(e.target.getStage()!)
            }}
        > 
            {cloneElement(shape, {
                ref: shapeRef,
                id: id.current,
                name: id.current,
                shadowBlur: shapeProps.shadowBlur || 1,
                onMouseOver: (e: any) => {
                    if (!selectd) {
                        setDraggable(true)
                    }
                    e.target.getStage()!.container().style.cursor = 'move';
                },
                onClick: (e: any) => {
                    if (!selectd) {
                        setSelectd(e.target.id())
                    }
                    shapeProps.onClick?.(e)
                }
            })}
            {selectd ? transformer : null}
            {renderConnectPoint().map((connect) => (
                <Circle
                    x={connect.x}
                    y={connect.y}
                    name={id.current}
                    key={shortid.generate()}
                    stroke='black'
                    radius={5}
                    hitStrokeWidth={5}
                    fill='#fff'
                    onMouseOver={(e) => {
                        e.target.getStage()!.container().style.cursor = 'crosshair';
                        setDraggable(false)
                    }}
                    onMouseOut={(e) => {
                        e.target.getStage()!.container().style.cursor = 'move';
                        setDraggable(true)
                    }}
                />
            ))}
        </Group>
    )
}

export default useShape