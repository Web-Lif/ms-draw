import React, { FC, useEffect, useRef, useState, ReactNode, useMemo } from 'react'
import { Stage, Layer, Arrow } from 'react-konva'
import styled from 'styled-components'
import Konva from 'konva'
import shortid from 'shortid'

import ShapeWrap from './ShapeWrap'
import { ArrowPosition, DesignerData, Shape } from '../types'
import { getCircle } from '../utils/rough'
import { getConnectPoint } from '../utils/connect'
import Image from './Image'

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ebedf1;
`;


interface DesignerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    data: DesignerData
    debug: boolean
    onChange: (data: DesignerData) => void
}

const Designer: FC<DesignerProps> = ({
    debug,
    data,
    onChange,
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

    useEffect(() => {
        setSize({
            width: ref.current?.offsetWidth || 0,
            height: ref.current?.offsetHeight || 0,
        });
    }, []);


    const isInit = useRef<boolean>(false)
    useEffect(() => {
        if (isInit.current) {
            layerRef.current?.toggleHitCanvas()
        }
        isInit.current = true
    }, [debug])


    const shapesNodes = useMemo(() => {
        const selectShape: Shape[] = []
        const shapes: Shape[] = []

        data.shape.forEach(ele => {
            if (ele.selectd) {
                selectShape.push(ele)
            } else {
                shapes.push(ele)
            }
        })

        if (selectShape.length > 0) {
            selectShape.forEach(ele => {
                shapes.push(ele)
            })
        }

        const shapeElements: ReactNode[] = []

        shapes.forEach((ele) => {
            const key = shortid.generate()
            if (ele.type === 'Circle') {
                shapeElements.push((
                    <ShapeWrap
                        key={ele.id}
                        x={ele.x}
                        y={ele.y}
                        type={ele.type}
                        selectd={ele.selectd || false}
                        onChange={(shapeChange) => {
                            const changeDataIndex = data.shape.findIndex(shape => shape.id === ele.id)
                            if (shapeChange.selectd) {
                                data.shape.forEach(ele => {
                                    ele.selectd = false
                                })
                            }

                            if (changeDataIndex !== -1) {
                                data.shape[changeDataIndex] = {
                                    ...data.shape[changeDataIndex],
                                    ...shapeChange
                                }
                            }
                            onChange({ ...data })
                        }}
                        onClickConnect={(id, index) => {
                            data.arrows.push({
                                id: shortid.generate(),
                                source: {
                                    id,
                                    junction: index
                                },
                                state: 'draw'
                            })
                        }}
                    >
                        <Image
                            id={ele.id || key}
                            key={ele.id || key}
                            width={ele.width}
                            height={ele.height}
                            url={getCircle(ele.width, ele.height)}
                            // stroke='black'
                        />
                    </ShapeWrap>
                ))
            }
        })
        return shapeElements
    }, [data])

    const arrowNodes = useMemo(() => {
        const arrows: ReactNode[] = []
        if (!data.arrows) {
            data.arrows = []
        }
        data.arrows.forEach(ele => {
            const {
                source,
                target,
                id
            } = ele

            const getPoints = (arrowPosition: ArrowPosition) => {
                const findEle = stageRef.current?.findOne(`#${arrowPosition.id}`)!
                const element = data.shape.find(ele => ele.id == arrowPosition.id)
                const connectPoint = getConnectPoint(findEle, element!.type!)[arrowPosition.junction]
                return [element!.x + connectPoint.x, element!.y + connectPoint.y]
            }

            const getSourcePoint = () => getPoints(source)

            const getTargetPoint = () => {
                if (Array.isArray(target)) {
                    return target
                } else if (target){
                    return getPoints(target)
                }
                return []
            }

            arrows.push(
                <Arrow
                    points={[...getSourcePoint(), ...getTargetPoint()]}
                    fill="black"
                    stroke="black"
                    key={id}
                    strokeWidth={2}
                />
            )

        })
        return arrows
    },[data])


    const onClickIdleAreaEvent = (e: Konva.KonvaEventObject<TouchEvent | MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            data.shape.forEach(ele => {
                ele.selectd = false
            })
            onChange({ ...data })
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
                onMouseUp={() => {
                    data.arrows.forEach(ele => {
                        ele.state = 'finish'
                    })
                    onChange({ ...data })
                }}
                onMouseMove={(e) => {
                    const {x, y} = e.target.getStage()!.getPointerPosition()!
                    data.arrows.forEach(ele => {
                        if (ele.state === 'draw') {
                            ele.target = [x, y]
                        }
                    })
                    onChange?.({...data})
                }}
                onWheel={(e) => {
                    // zoom(1.03, e.evt.deltaY)
                }}
            >
                <Layer
                    ref={layerRef}
                >
                    {shapesNodes}
                    {arrowNodes}
                </Layer>
            </Stage>
        </Container>
    );
};

export default Designer;
