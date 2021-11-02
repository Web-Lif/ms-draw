import React, { FC, useEffect, useRef, useState, ReactNode } from 'react'
import { Stage, Circle, Layer } from 'react-konva'
import styled from 'styled-components'
import Konva from 'konva'
import shortid from 'shortid'

import useShape from './hooks/useShape'


const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ebedf1;
`;



interface Arrow {
    id: string
    source: number[]
    target: number[]
}

interface Shape {
    type: 'Circle'
    id: string
    x: number
    y: number
    height: number
    width: number
}

interface DesignerData {
    arrows: Arrow[]  
    shape: Shape[] 
}

interface DesignerProps extends React.HTMLAttributes<HTMLDivElement> {
    data: DesignerData
    debug: boolean
}

const Designer: FC<DesignerProps> = ({
    debug,
    data,
    ...restProps
}) => {
    const [size, setSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    const ref = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null)
    const layerRef = useRef<Konva.Layer>(null)

    const history = useRef<object[]>([])

    useEffect(() => {
        setSize({
            width: ref.current?.offsetWidth || 0,
            height: ref.current?.offsetHeight || 0,
        });
        if (debug) {
            layerRef.current?.toggleHitCanvas()
        }
    }, []);


    const [selectd, setSelectd] = useState<string>('')
    const [hover, setHover] = useState<string>('')

    // 添加到历史记录
    const addHistory = (stage: Konva.Stage) => {
        if (history.current.length > 100) {
            history.current.splice(0, 1)
        }
        history.current.push(stage.toObject())
    }

    const shapes: ReactNode[] = []
    data.shape.forEach((ele) => {
        let shape
        const key = shortid.generate()
        if (ele.type === 'Circle') {
            shape = useShape({
                selectd,
                hover,
                setSelectd,
                addHistory,
                shape: (
                    <Circle
                        id={ele.id || key}
                        key={ele.id || key}
                        x={ele.x}
                        y={ele.y}
                        width={ele.width}
                        height={ele.height}
                        stroke='black'
                    />
                )
            })

        }
        shapes.push(shape)
    })

    const onClickIdleAreaEvent = (e: Konva.KonvaEventObject<TouchEvent | MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectd('');
        }
    }

    /**
     * 进行页面的缩放
     * @param scaleBy 缩放比例
     * @param scaling 大于 0 是放大， 小于等于 0 是缩小
     */
    const zoom = (scaleBy: number, scaling: number = 0) => {
        const oldScale = stageRef.current!.scaleX();
        const pointer = stageRef.current!.getPointerPosition()!;
        const mousePointTo = {
            x: (pointer.x - stageRef.current!.x()) / oldScale,
            y: (pointer.y - stageRef.current!.y()) / oldScale,
        };
        const newScale =
            scaling > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stageRef.current!.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stageRef.current!.position(newPos);
    }

    return (
        <Container
            ref={ref}
            {...restProps}
        >
            <Stage
                ref={stageRef}
                width={size.width}
                height={size.height}
                onMouseDown={onClickIdleAreaEvent}
                onTouchStart={onClickIdleAreaEvent}
                onMouseMove={(e) => {
                    const isMoveEmpty = e.target === e.target.getStage();
                    if (isMoveEmpty) {
                        e.target.getStage()!.container().style.cursor = 'default';
                        setHover('')
                    } else {
                        setHover(e.target.name())
                    }
                }}
                onWheel={(e) => {
                    // zoom(1.03, e.evt.deltaY)
                }}
            >
                <Layer
                    ref={layerRef}
                >
                    {shapes}
                </Layer>
            </Stage>
        </Container>
    );
};

export default Designer;
