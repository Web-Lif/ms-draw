import React, { cloneElement, useRef, useEffect, useState } from 'react'
import { Transformer, Circle, Group} from 'react-konva'
import Konva from 'konva'
import shortid from 'shortid'


import { Shape } from '../types'
import { getConnectPoint } from '../utils/connect'

interface ShapeParam {
    x: number
    y: number
    type: string
    selectd: boolean
    onChange: (data: {
        x?: number,
        y?: number,
        selectd?: boolean
    }) => void
    children: JSX.Element
    onClickConnect?: (id: string, index: number) => void
}

const ShapeWrap = ({
    x,
    y,
    children,
    type,
    selectd,
    onChange,
    onClickConnect
}: ShapeParam) => {
    const shapeProps = children.props

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
            onTransform={(e) => {
                onChange({
                    x,
                    y,
                    selectd: true
                })
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

    const [isHoverConnectPoint, setHoverConnectPoint] = useState<boolean>(false)

    const renderConnectPoint = (): {x: number, y: number}[] => {
        if (isHoverConnectPoint) {
            return getConnectPoint(shapeRef.current!, type)
        }
        return []
    }

    return (
        <Group
            x={x}
            y={y}
            name={id.current}
            draggable={draggable}
            key={`group-${id.current}`}
            onDragStart={(e) => {
                onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                })
                setHoverConnectPoint(false)
            }}
            onDragMove={(e) =>  {
                onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                })
            }}
            onDragEnd={(e) => {
                const size = shapeRef.current!.getSize()
                const x = e.target.x()
                const y = e.target.y()
                onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    selectd: true
                })
            }}
            onClick={(e) => {
                onChange({
                    selectd: true
                })
            }}
            onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
                setHoverConnectPoint(false)
            }}
        > 
            {cloneElement(children, {
                ref: shapeRef,
                id: id.current,
                key: children.key,
                name: id.current,
                shadowBlur: shapeProps.shadowBlur || 1,
                onMouseOver: (e: any) => {
                    setDraggable(true)
                    e.target.getStage()!.container().style.cursor = 'move';
                    setHoverConnectPoint(true)
                }
            })}
            {selectd ? transformer : null}
            {renderConnectPoint().map((connect, index) => (
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
                    onMouseDown={(e) => {
                        const id = e.target.name()
                        onClickConnect?.(id, index)
                    }}
                />
            ))}
        </Group>
    )
}

export default ShapeWrap