import React, { FC, useEffect, useRef, useState, ReactNode, cloneElement, Key } from 'react';
import { Stage, Layer, Arrow } from 'react-konva';
import styled from 'styled-components';
import Konva from 'konva';

import Circle from './circle';

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ebedf1;
`;

export interface Data {
    className: 'Layer' | 'Circle',
    attrs: {
        id: string,
        x?: number,
        y?: number,
        width?: number,
        height?: number
        connectTarget?: string
    },
    children: Data[]
}


interface Connect {
    id: string
    points: number[]
}

interface DesignerProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Data[]
    onChangeData: (json: Data[]) => void
}


const calcPath = (source: Konva.Vector2d, target: Konva.Vector2d) => {
    const path: number[] = []
    path.push(source.x, source.y)
    if (
        Math.abs(source.y  - target.y)  > 8
          &&
        Math.abs(source.x - target.x) > 8
    ) {
        path.push(source.x, target.y)
    }
    path.push(target.x, target.y)
    return path
}


const Designer: FC<DesignerProps> = ({
    data = [],
    onChangeData = () => {}, 
    ...restProps
}) => {
    const [size, setSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    const [select, setSelect] = useState<string | null>(null);

    const ref = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null)

    useEffect(() => {
        setSize({
            width: ref.current?.offsetWidth || 0,
            height: ref.current?.offsetHeight || 0,
        });
    }, []);

    const checkDeselect = (
        e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    ) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelect(null);
        }
    };

    const [connect, setConnect] = useState<Connect>()
    const [connects, setConnects] = useState<Connect[]>([])
    const [isMove, setMove] = useState<boolean>(false)

    const count = useRef<number>(0)

    const renderLayers = () => {
        const layers: ReactNode[] = []
        data.forEach((ele: any) => {
            const graph: ReactNode[] = []
            ele?.children.forEach((img: any) => {
                if (img.className === 'Circle') {
                    const imgTemp = (
                        <Circle
                            id={img.attrs.id}
                            x={img.attrs.x}
                            y={img.attrs.y}
                            key={img.attrs.id}
                            width={img.attrs.width}
                            height={img.attrs.height}
                            isSelected={select === img.attrs.id}
                            onClick={(e) => {
                                setSelect(e.target.attrs.id);
                            }}
                            onDragMove={(e, connectType) => {
                                const datas:Connect[] = []
                                connects.forEach(ele => {
                                    let points = ele.points
                                    const position = (connectType as any)[ele.id.split('-')[1]]
                                    if (ele.id.split('-')[0] === img.attrs.id) {
                                        points = calcPath(position, {
                                            x: points[points.length - 2],
                                            y: points[points.length - 1]
                                        })
                                    }
                                    datas.push({
                                        ...ele,
                                        points,
                                    })
                                })
                                setConnects(datas)
                            }}
                            onConnectMouseDown={(e, direction) => {
                                count.current += 1
                                const postion = e.currentTarget.getPosition()
                                setConnect({
                                    id: `${img.attrs.id}-${direction}-${count.current}`,
                                    points: [postion.x, postion.y]
                                })
                                setMove(true)
                            }}
                        />
                    )
                    graph.push(imgTemp)
                }
            })
            layers.push(
                <Layer
                    key={ele.attrs.id}
                >
                    {graph}
                    {connects.map(ele => {
                        const data = (
                            <Arrow
                                id={ele.id}
                                key={ele.id}
                                points={ele.points}
                                fill="black"
                                stroke="black"
                                onMouseDown={(e) => {
                                    const conn = connects.find(conn => conn.id === ele.id)
                                    if (conn) {
                                        setMove(true)
                                        setConnect({
                                            id: ele.id,
                                            points: conn.points
                                        })
                                        
                                    }
                                }}
                            />
                        )
                        if (isMove && ele.id == connect?.id) {
                            return null
                        }
                        return data
                    })}
                    {isMove ? (
                        <Arrow
                            points={connect!.points}
                            fill="black"
                            stroke="black"
                        />
                    ) : null} 
                </Layer>
            )
        })
        return layers
    }


    const isInvalidArrow= (data: number[]) => {
        console.log(data)
        const [x,y] = data
        const nx = data[data.length - 2]
        const ny = data[data.length - 1]
        if (Math.abs(x - nx) > 30 || Math.abs(y - ny ) > 30) {
            return false
        }
        return true
    }

    return (
        <Container ref={ref} {...restProps}>
            <button
                onClick={() => {
                    console.log(stageRef.current?.toObject().children)
                }}
            >
                test
            </button>
            <Stage
                ref={stageRef}
                width={size.width}
                height={size.height}
                onMouseDown={(e) => {
                    checkDeselect(e)
                }}
                onMouseUp={() => {
                    if (connect) {

                        if (connects.findIndex(ele => ele.id === connect.id) === -1 && !isInvalidArrow(connect.points)) {
                            connects.push({
                                id: connect.id,
                                points: connect.points
                            })
                        }
                    
                        setConnects([...connects])
                        setMove(false)
                    }

                }}
                onMouseMove={(e) => {
                    if (connect && isMove) {
                        const [x, y] = connect.points
                        const position = stageRef.current?.getPointerPosition()

                        if (position) {
                            setConnect({
                                ...connect,
                                points: calcPath({ x, y }, position)
                            })
                        }

                    }
                }}
                onTouchStart={checkDeselect}
            >
                {renderLayers()}
            </Stage>
        </Container>
    );
};

export default Designer;
