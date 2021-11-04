import React, { cloneElement, useRef, useEffect, useState } from 'react';
import { Transformer, Circle, Group } from 'react-konva';
import Konva from 'konva';
import shortid from 'shortid';

import { getConnectPoint } from '../utils/connect';

interface ShapeParam {
    x: number;
    y: number;
    selectd: boolean;
    onChange: (data: { x?: number; y?: number; width?: number, height?: number, selectd?: boolean }) => void;
    children: JSX.Element;
    onClickConnectDown?: (id: string, index: number) => void;
    onClickConnectUp?: (id: string, index: number) => void;
}

const ShapeWrap = ({
    x,
    y,
    children,
    selectd,
    onChange,
    onClickConnectDown,
    onClickConnectUp,
}: ShapeParam) => {
    const shapeProps = children.props;

    const shapeRef = useRef<Konva.Shape>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const id = useRef<string>(shapeProps.id || shortid.generate());

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
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                onChange({
                    x,
                    y,
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(node.height() * scaleY),
                    selectd: true,
                });
            }}
            onTransform={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                onChange({
                    x,
                    y,
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(node.height() * scaleY),
                    selectd: true,
                });
            }}
        />
    );

    const [draggable, setDraggable] = useState<boolean>(true);

    useEffect(() => {
        if (selectd) {
            transformerRef.current?.nodes([shapeRef.current!]);
            transformerRef.current?.getLayer()?.batchDraw();
        }
    }, [selectd]);

    const [isHoverConnectPoint, setHoverConnectPoint] =
        useState<boolean>(false);

    const renderConnectPoint = (): { x: number; y: number }[] => {
        if (isHoverConnectPoint) {
            return getConnectPoint(shapeRef.current!);
        }
        return [];
    };

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
                });
                setHoverConnectPoint(false);
            }}
            onDragMove={(e) => {
                onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}
            onDragEnd={(e) => {
                onChange({
                    x: e.target.x(),
                    y: e.target.y(),
                    selectd: true,
                });
            }}
            onClick={() => {
                onChange({
                    selectd: true,
                });
                setHoverConnectPoint(false);
            }}
            onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
                setHoverConnectPoint(false);
            }}
            onMouseEnter={(e) => {
                setDraggable(true);
                e.target.getStage()!.container().style.cursor = 'move';
                if (selectd === false) {
                    setHoverConnectPoint(true);
                }
            }}
        >
            {cloneElement(children, {
                ref: shapeRef,
                id: id.current,
                key: children.key,
                name: id.current,
                shadowBlur: shapeProps.shadowBlur || 1,
            })}
            {selectd ? transformer : null}
            {renderConnectPoint().map((connect, index) => (
                <Circle
                    x={connect.x}
                    y={connect.y}
                    name={id.current}
                    key={index}
                    stroke="black"
                    radius={5}
                    hitStrokeWidth={5}
                    fill="#fff"
                    onMouseDown={(e) => {
                        const id = e.target.name();
                        onClickConnectDown?.(id, index);
                    }}
                    onMouseUp={(e) => {
                        const id = e.target.name();
                        onClickConnectUp?.(id, index);
                    }}
                    onMouseEnter={(e) => {
                        e.target.getStage()!.container().style.cursor =
                            'crosshair';
                        setDraggable(false);
                    }}
                    onMouseLeave={(e) => {
                        e.target.getStage()!.container().style.cursor =
                            'default';
                        setHoverConnectPoint(false);
                    }}
                />
            ))}
        </Group>
    );
};

export default ShapeWrap;
