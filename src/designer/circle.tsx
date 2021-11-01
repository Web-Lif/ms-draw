import React, { FC, useEffect, useRef, useState } from 'react';
import { Circle as RKCircle, Transformer } from 'react-konva';
import Konva from 'konva';

interface Position {
    x: number
    y: number
}

type ConnectType = {
    top: Position
    left: Position
    bottom: Position
    right: Position
}


interface CircleProps {
    id: string;
    isSelected: boolean;
    presetArrayPath?: number[]
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    sourceTarget?: string
    onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onConnectMouseDown?: (evt: Konva.KonvaEventObject<MouseEvent>, direction: 'left' | 'right' | 'top' | 'bottom') => void;
    onDragMove?: (evt: Konva.KonvaEventObject<DragEvent>, connectType: ConnectType) => void
}


const Circle: FC<CircleProps> = ({
    id,
    isSelected,
    x = 100,
    y = 100,
    width = 100,
    height = 100,
    onClick,
    onConnectMouseDown,
    onDragMove
}) => {
    const circleRef = useRef<Konva.Circle>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const [connectType, setConnectType] = useState<ConnectType>()


    const getConnect = () => {
        const position = circleRef.current!.getPosition()
        const width = circleRef.current!.getWidth() 
        const heigt = circleRef.current!.getHeight()
        const connect: ConnectType = {
            top: {
                x: position!.x,
                y:  position!.y - height / 2 - 10
            },
            left: {
                x: position!.x - width / 2 - 10,
                y: position!.y
            },
            bottom: {
                x: position!.x,
                y: position!.y + heigt / 2 + 10
            },
            right: {
                x: position!.x + width / 2 + 10,
                y: position!.y 
            }
        }
        return connect
    }
    const updateConnect = () => {
        setConnectType(getConnect())
    }

    useEffect(() => {
        if (isSelected) {
            updateConnect()
        }
    }, [isSelected]);

    const calcConnect = () => {
        if (connectType && isSelected) {
            return (
                <>
                    <RKCircle
                        x={connectType.top.x}
                        y={connectType.top.y}
                        width={10}
                        height={10}
                        onMouseDown={(e) => {
                            onConnectMouseDown?.(e, 'top')
                        }}
                    
                        stroke="black"
                    />
                    <RKCircle
                        x={connectType.left.x}
                        y={connectType.left.y}
                        width={10}
                        height={10}
                        onMouseDown={(e) => {
                            onConnectMouseDown?.(e, 'left')
                        }}
                        stroke="black"
                    />
                    <RKCircle
                        x={connectType.right.x}
                        y={connectType.right.y}
                        width={10}
                        height={10}
                        onMouseDown={(e) => {
                            onConnectMouseDown?.(e, 'right')
                        }}
                        stroke="black"
                    />
                    <RKCircle
                        x={connectType.bottom.x}
                        y={connectType.bottom.y}
                        width={10}
                        height={10}
                        onMouseDown={(e) => {
                            onConnectMouseDown?.(e, 'bottom')
                        }}
                        stroke="black"
                    />
                </>
            )
        }
        return null
    }

    return (
        <>
            {calcConnect()}
            <RKCircle
                id={id}
                ref={circleRef}
                draggable
                x={x}
                y={y}
                width={width}
                height={height}
                onClick={onClick}
                stroke="black"
                onDragMove={(e) => {
                    updateConnect()
                    onDragMove?.(e, getConnect())
                }}
            />
            {isSelected ? (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            ) : undefined}
        </>
    );
};

export default Circle;
