import React, {
    FC,
    useEffect,
    useRef,
    useState,
    ReactNode,
    useMemo,
} from 'react';
import { Stage, Layer, Arrow, Rect} from 'react-konva';
import styled from 'styled-components';
import Konva from 'konva';
import shortid from 'shortid';

import ShapeWrap from '../shapes/ShapeWrap';
import {
    ArrowPosition,
    DesignerData,
    Shape,
    Arrow as ArrowType,
} from '../types';
import { getCircle, getRect, getRhombus } from '../utils/rough';
import { getConnectPoint } from '../utils/connect';
import Swimlane from '../shapes/Swimlane'
import Image from './Image';

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ebedf1;
    outline: none;
    overflow: hidden;
`;

interface DesignerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    data: DesignerData;
    debug: boolean;
    onChange: (data: DesignerData) => void;
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
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

    useEffect(() => {
        setSize({
            width: ref.current?.offsetWidth || 0,
            height: ref.current?.offsetHeight || 0,
        });
    }, []);

    const isInit = useRef<boolean>(false);
    useEffect(() => {
        if (isInit.current) {
            layerRef.current?.toggleHitCanvas();
        }
        isInit.current = true;
    }, [debug]);

    const shapesNodes = useMemo(() => {
        const selectShape: Shape[] = [];
        const shapes: Shape[] = [];
        const bottoms: Shape[] = [];
        debugger
        data.shape.forEach((ele) => {
            if (ele.selectd ) {
                selectShape.push(ele);
            } else if (ele.type === 'Swimlane') {
                bottoms.push(ele)
            } else {
                shapes.push(ele);
            }
        });

        if (selectShape.length > 0) {
            selectShape.forEach((ele) => {
                shapes.push(ele);
            });
        }

        shapes.splice(0, 0, ...bottoms)

        console.log(shapes)

        const shapeElements: ReactNode[] = [];

        shapes.forEach((ele) => {
            const key = shortid.generate();
            const options = {
                fill: ele.fill,
                fillStyle: ele.fillStyle
            }

            if (ele.type === 'Swimlane') {
                shapeElements.push(
                    <>
                        
                        <ShapeWrap
                            key={ele.id}
                            shape={ele}
                            displayConnect={false}
                            external={(
                                <Swimlane
                                    shape={ele}
                                />
                            )}
                            onChange={(shapeChange) => {
                                const changeDataIndex = data.shape.findIndex(
                                    (shape) => shape.id === ele.id,
                                );
                                if (shapeChange.selectd) {
                                    data.shape.forEach((ele) => {
                                        ele.selectd = false;
                                    });
                                }
        
                                if (changeDataIndex !== -1) {
                                    data.shape[changeDataIndex] = {
                                        ...data.shape[changeDataIndex],
                                        ...shapeChange,
                                    };
                                }
                                onChange({ ...data });
                            }}
                        >
                            <Rect
                                id={ele.id || key}
                                key={ele.id || key}
                                width={ele.width}
                                height={ele.height}
                            />    
                        </ShapeWrap>
                    </>
                );
            } else {
                let url = getCircle(ele.width, ele.height, options)
                if (ele.type === 'Rect') {
                    url = getRect(ele.width, ele.height, options)
                    
                } else if (ele.type === 'Rhombus') {
                    url = getRhombus(ele.width, ele.height, options)
                }
    
                shapeElements.push(
                    <ShapeWrap
                        key={ele.id}
                        shape={ele}
                        onChange={(shapeChange) => {
                            const changeDataIndex = data.shape.findIndex(
                                (shape) => shape.id === ele.id,
                            );
                            if (shapeChange.selectd) {
                                data.shape.forEach((ele) => {
                                    ele.selectd = false;
                                });
                            }
    
                            if (changeDataIndex !== -1) {
                                data.shape[changeDataIndex] = {
                                    ...data.shape[changeDataIndex],
                                    ...shapeChange,
                                };
                            }
                            onChange({ ...data });
                        }}
                        onClickConnectDown={(id, index) => {
                            data.arrows.push({
                                id: shortid.generate(),
                                source: {
                                    id,
                                    junction: index,
                                },
                                state: 'draw',
                            });
                        }}
                        onClickConnectUp={(id, index) => {
                            data.arrows.forEach((ele) => {
                                if (ele.state === 'draw') {
                                    ele.target = {
                                        id,
                                        junction: index,
                                    };
    
                                }
                            });
                        }}
                    >
                        <Image
                            id={ele.id || key}
                            key={ele.id || key}
                            width={ele.width}
                            height={ele.height}
                            url={url}
                        />
                    </ShapeWrap>,
                );
                
            }


        });
        return shapeElements;
    }, [data]);

    const getPoints = (arrowPosition: ArrowPosition) => {
        const findEle = stageRef.current?.findOne(`#${arrowPosition.id}`)!;
        const element = data.shape.find(
            (ele) => ele.id == arrowPosition.id,
        );
        const connectPoint = getConnectPoint(findEle)[
            arrowPosition.junction
        ];
        return [element!.x + connectPoint.x, element!.y + connectPoint.y];
    };

    // 计算折线的坐标
    const getArrowLinkPath = (arrow: ArrowType) => {


        const getSourcePoint = () => getPoints(arrow.source);

        const getTargetPoint = () => {
            if (Array.isArray(arrow.target)) {
                return arrow.target;
            } else if (arrow.target) {
                return getPoints(arrow.target);
            }
            return [];
        };

        const source = getSourcePoint();
        const target = getTargetPoint();
        const sx = source[0];
        const sy = source[1];

        const tx = target[0];
        const ty = target[1];

        if (source?.length >= 2 && target?.length >= 2) {
            const points: number[] = [];
            points.push(...source);

            /**
             *  对应的坐标信息
             *
             *      0  |  1
             *     ----|-----
             *      3  |  2
             *
             */
            const getDirection = (coordinate: number[]): 0 | 1 | 2 | 3 => {
                const sourceX = coordinate[0];
                const sourceY = coordinate[1];

                const targetX = coordinate[2];
                const targetY = coordinate[3];

                if (sourceX > targetX && sourceY > targetY) {
                    return 2;
                } else if (sourceX < targetX && sourceY < targetY) {
                    return 0;
                } else if (sourceX > targetX && sourceY < targetY) {
                    return 1;
                } else if (sourceX < targetX && sourceY > targetY) {
                    return 3;
                }
                return 0;
            };

            const direction = getDirection([...source, ...target]);

            if (!Array.isArray(arrow.target)) {
                const arrowTarget = arrow.target as ArrowPosition;
                const { height, width } = data.shape.find(
                    (ele) => arrowTarget?.id === ele.id,
                )!;
                const offset = 20;
                if (arrow.source.junction === 0) {
                    if (arrow.target?.junction === 0) {
                        if (direction === 2 || direction === 3) {
                            points.push(sx, ty - offset, tx, ty - offset);
                        } else {
                            points.push(sx, sy - offset, tx, sy - offset);
                        }
                    } else if (arrow.target?.junction === 1) {
                        if (direction === 1) {
                            points.push(
                                sx,
                                sy - offset,
                                sx - offset - width / 2,
                                sy - offset,
                                sx - offset - width / 2,
                                ty,
                            );
                        } else if (direction === 2) {
                            points.push(sx, ty);
                        } else if (direction == 3) {
                            points.push(
                                sx,
                                ty - offset - height / 2,
                                tx + offset,
                                ty - offset - height / 2,
                                tx + offset,
                                ty,
                            );
                        } else if (direction === 0) {
                            points.push(
                                sx,
                                sy - offset,
                                tx + offset,
                                sy - offset,
                                tx + offset,
                                ty,
                            );
                        }
                    } else if (arrow.target?.junction === 2) {
                        if (direction === 2 || direction === 3) {
                            points.push(sx, sy - offset, tx, sy - offset);
                        } else if (direction === 0) {
                            points.push(
                                sx,
                                sy - offset,
                                sx + width / 2 + offset,
                                sy - offset,
                                sx + width / 2 + offset,
                                ty + offset,
                                tx,
                                ty + offset,
                            );
                        } else if (direction === 1) {
                            points.push(
                                sx,
                                sy - offset,
                                sx - width / 2 - offset,
                                sy - offset,
                                sx - width / 2 - offset,
                                ty + offset,
                                tx,
                                ty + offset,
                            );
                        }
                    } else if (arrow.target?.junction === 3) {
                        if (direction === 3) {
                            points.push(sx, ty);
                        } else if (direction === 2) {
                            points.push(
                                sx,
                                sy - offset,
                                sx - width / 2 - offset,
                                sy - offset,
                                sx - width / 2 - offset,
                                sy - offset + height / 2,
                                tx - offset,
                                sy - offset + height / 2,
                                tx - offset,
                                ty,
                            );
                        } else if (direction === 1 || direction === 0) {
                            points.push(
                                sx,
                                sy - offset,
                                tx - offset,
                                sy - offset,
                                tx - offset,
                                ty,
                            );
                        }
                    }
                } else if (arrow.source.junction === 1) {
                    if (arrow.target!.junction === 0) {
                        if (direction === 3 || direction === 2) {
                            points.push(
                                sx + offset, sy,
                                sx + offset, ty - offset,
                                tx, ty - offset
                            )
                        } else if (direction === 0) {
                            points.push(
                                tx, sy,
                                tx, ty - offset
                            )
                        } else if (direction === 1) {
                            points.push(
                                sx + offset, sy,
                                sx + offset, ty - offset,
                                tx, ty - offset
                            )
                        }

                    } else if (arrow.target!.junction === 1) {
                        if (direction === 3 || direction === 0) {
                            points.push(
                                tx + offset, sy,
                                tx + offset, ty,
                            )
                        } else if (direction === 1 || direction === 2) {
                            points.push(
                                sx + offset, sy,
                                sx + offset, ty
                            )
                        }

                    } else if (arrow.target!.junction === 2) {
                        if (direction === 3) {
                            points.push(
                                tx, sy
                            )
                        } else if (direction === 2) {
                            if (sy - ty <= height) {
                                points.push(
                                    sx + offset, sy,
                                    sx + offset, sy + height / 2 + offset,
                                    tx, sy + height / 2 + offset
                                )
                            } else {
                                points.push(
                                    sx + offset, sy,
                                    sx + offset, sy - height / 2 - offset,
                                    tx, sy - height / 2 - offset
                                )
                            }
                        }
                    } else if (arrow.target!.junction === 3) {
                        if (direction === 0 || direction === 3) {
                            points.push(
                                sx + offset, sy,
                                sx + offset, ty
                            )
                        } else if (direction === 2) {
                            if (sy - ty <= height) {
                                points.push(
                                    sx + offset, sy,
                                    sx + offset, sy + height / 2 + offset,
                                    tx, sy + height / 2 + offset,
                                    tx - offset, sy + height / 2 + offset,
                                    tx - offset, ty
                                )
                            } else {
                                points.push(
                                    sx + offset, sy,
                                    sx + offset, sy - height / 2 - offset,
                                    tx - offset, sy - height / 2 - offset,
                                    tx - offset, ty
                                )
                            }
                        } else if (direction === 1) {
                            points.push(
                                sx + offset, sy,
                                sx + offset, sy - height / 2 - offset,
                                tx - offset, sy - height / 2 - offset,
                                tx - offset, ty
                            )
                        }
                    }
                } else if (arrow.source.junction === 2) {
                    if (arrow.target?.junction === 0) {
                        if (direction === 0 || direction === 1) {
                            points.push(
                                sx, ty - offset,
                                tx, ty - offset
                            )
                        } else if (direction === 2) {
                            points.push(
                                sx, sy + offset,
                                sx - height / 2 - offset, sy + offset,
                                sx - height / 2 - offset, ty - offset,
                                tx, ty - offset
                            )
                        } else if (direction === 3) {
                            points.push(
                                sx, sy + offset,
                                sx + height / 2 + offset, sy + offset,
                                sx + height / 2 + offset, ty - offset,
                                tx, ty - offset
                            )
                        }
                    } else if (arrow.target?.junction === 1) {
                        points.push(
                            sx, sy + offset,
                            tx + offset, sy + offset,
                            tx + offset, ty,
                        )
                    } else if (arrow.target?.junction === 2) {
                        if (direction === 0 || direction === 1) {
                            points.push(
                                sx, ty + offset,
                                tx, ty + offset,
                            )
                        } else if (direction === 2 || direction === 3) {
                            points.push(
                                sx, sy + offset,
                                tx, sy + offset,
                            )
                        }
                    } else if (arrow.target?.junction === 3) {
                        if (direction === 3) {
                            points.push(
                                sx, sy + offset,
                                sx + width / 2 + offset, sy + offset,
                                sx + width / 2 + offset, ty
                            )
                        } else if (direction === 0) {
                            points.push(
                                sx, ty,
                            )
                        } else if (direction === 1 || direction === 2) {
                            points.push(
                                sx, sy + offset,
                                tx - offset, sy + offset,
                                tx - offset, ty,
                            )
                        }
                    }
                } else if (arrow.source.junction === 3) {
                    if (arrow.target?.junction === 0) {
                        points.push(
                            sx - offset, sy,
                            sx - offset, ty - offset,
                            tx, ty - offset,
                        )
                    } else if (arrow.target?.junction === 1) {
                        if (direction === 3 || direction === 0) {
                            points.push(
                                sx - offset, sy,
                                sx - offset, ty - offset - height / 2,
                                tx + offset, ty - offset - height / 2,
                                tx + offset, ty,
                            )
                        } else if (direction === 1 || direction === 2) {
                            points.push(
                                tx + offset, sy,
                                tx + offset, ty
                            )
                        }
                    } else if (arrow.target?.junction === 2) {
                        if (direction === 3) {
                            points.push(
                                sx - offset, sy,
                                sx - offset, sy - height / 2 - offset,
                                tx, sy - height / 2 - offset
                            )
                        } else if (direction === 2) {
                            points.push(
                                tx, sy
                            )
                        } else if (direction === 0) {
                            points.push(
                                sx - offset, sy,
                                sx - offset, ty + offset,
                                tx, ty + offset,
                            )
                        } else if (direction === 1) {
                            points.push(
                                sx - offset, sy,
                                sx - offset, ty + offset,
                                tx, ty + offset,
                            )
                        }
                    } else if (arrow.target?.junction === 3) {
                        if (direction === 0 || direction === 3) {
                            points.push(
                                sx - offset, sy,
                                sx - offset, ty,
                            )
                        } else if (direction === 1 || direction === 2) {
                            points.push(
                                tx - offset, sy,
                                tx - offset, ty,
                            )
                        }
                    }
                }
            }

            points.push(...target);
            return points;
        }
        return [...source, ...target];
    };
    const arrowNodes = useMemo(() => {
        const arrows: ReactNode[] = [];
        if (!data.arrows) {
            data.arrows = [];
        }
        data.arrows.forEach((ele) => {
            const { id } = ele;
            arrows.push(
                <Arrow
                    id={id}
                    points={getArrowLinkPath(ele)}
                    fill="black"
                    stroke="black"
                    key={id}
                    strokeWidth={2}
                    onMouseDown={(e) => {
                        const targetId = e.target.id();
                        data.arrows.forEach((ele) => {
                            if (ele.id === targetId) {
                                ele.state = 'draw';
                                ele.selectd = true;
                            } else {
                                ele.selectd = false;
                            }
                        });
                        data.shape.forEach((ele) => {
                            ele.selectd = false;
                        });
                        onChange({ ...data });
                    }}
                />,
            );
        });
        return arrows;
    }, [data]);

    const onClickIdleAreaEvent = (
        e: Konva.KonvaEventObject<TouchEvent | MouseEvent>,
    ) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            data.shape.forEach((ele) => {
                ele.selectd = false;
            });
            onChange({ ...data });
        }
    };


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
        const newScale = scaling > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stageRef.current!.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stageRef.current!.position(newPos);
    };

    return (
        <>
             <div style={{ width: 200}}>
                <span> x: {stageRef.current?.getPointerPosition()?.x} </span>
                <span> y: {stageRef.current?.getPointerPosition()?.y} </span>
            </div>
            <Container
                tabIndex={-1}
                ref={ref}
                {...restProps}
                onKeyDown={(e) => {
                    if (e.key === 'Delete') {
                        data.arrows = data.arrows.filter((ele) => !ele.selectd);
                        data.shape = data.shape.filter((ele) => !ele.selectd);
                        onChange?.({ ...data });
                    }
                }}
            >
            
                <Stage
                    ref={stageRef}
                    width={size.width}
                    height={size.height}
                    onMouseDown={onClickIdleAreaEvent}
                    onTouchStart={onClickIdleAreaEvent}
                    onMouseUp={() => {
                        const arrowsTemp: ArrowType[] = []
                        data.arrows.forEach((ele) => {
                            if (ele.state === 'finish') {
                                arrowsTemp.push(ele)
                            } else if (ele.state === 'draw' && ele.target) {
                                const target = ele.target
                                if (((!Array.isArray(target) && ele.source.id !== target.id)) || Array.isArray(target)) {
                                    ele.state = 'finish'
                                    arrowsTemp.push(ele)
                                }
                            }
                        })

                        data.arrows = arrowsTemp
                        onChange({ ...data });
                    }}
                    onMouseMove={(e) => {
                        const { x, y } = e.target.getStage()!.getPointerPosition()!;
                        data.arrows.forEach((ele) => {
                            if (ele.state === 'draw') {
                                ele.target = [x, y];
                            }
                        });
                        onChange?.({ ...data });
                    }}
                    onWheel={(e) => {
                        // zoom(1.03, e.evt.deltaY)
                    }}
                >
                    <Layer ref={layerRef}>
                        {arrowNodes}
                        {shapesNodes}
                    </Layer>
                </Stage>
            </Container>
        </>
    );
};

export default Designer;
