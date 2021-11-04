import React, { cloneElement, useRef, useEffect, useState, useLayoutEffect, ReactNode } from 'react';
import { Transformer, Circle, Group } from 'react-konva';
import Konva from 'konva';
import shortid from 'shortid';
import { Html } from 'react-konva-utils';
import styled from 'styled-components'
import html2canvas from 'html2canvas'

import { getConnectPoint } from '../utils/connect';
import { toBase64Url } from '../utils/rough'
import { Shape } from '../types'
import Image from './Image'

const Editor = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    > div {
        padding: 0px 10%;
        box-sizing: border-box;
    }
`

interface ShapeParam {
    shape: Shape
    onChange: (data: {
        x?: number,
        y?: number,
        width?: number
        height?: number,
        text?: string,
        selectd?: boolean
    }) => void;
    children: JSX.Element;
    onClickConnectDown?: (id: string, index: number) => void;
    onClickConnectUp?: (id: string, index: number) => void;
}

interface EditorParam {
    x: number
    y: number
    width: number
    height: number
    text: string,
    visible: boolean,
    onChange?: (text: string) => void
    onBlur?: () => void
    onDblClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
}


const useEditor = ({
    x,
    y,
    width,
    height,
    text,
    visible,
    onChange,
    onBlur,
    onDblClick
}: EditorParam) => {

    const editRef = useRef<HTMLDivElement>(null)
    const editContentRef = useRef<HTMLDivElement>(null)

    const [url, setUrl] = useState<string>('')
    useLayoutEffect(() => {
        if (visible) {
            editContentRef.current?.focus()
        }
    }, [visible])


    return (
        <>
            <Html
                divProps={{
                    style: {
                        position: 'absolute',
                        display: 'flex',
                        left: x,
                        top: y,
                    },
                }}
            >
                <Editor
                    ref={editRef}
                    style={{
                        width,
                        height,
                        display: visible ? 'flex' : 'none'
                    }}
                    onBlur={() => {
                        onBlur?.()
                        console.log(editRef.current)
                        if (editRef.current) {
                            html2canvas(editRef.current, {
                                backgroundColor: null
                            }).then((svg) => {
                                setUrl(svg.toDataURL())
                            })
                        }
                    }}
                    onChange={(e) => {
                        onChange?.(e.currentTarget.textContent!)
                    }}
                >
                    <div
                        ref={editContentRef}
                        suppressContentEditableWarning
                        tabIndex={-1}
                        contentEditable
                        style={{
                            maxWidth: width,
                        }}
                    >
                        {text}
                    </div>
                </Editor>
            </Html>
            {!visible ? (
                <Image
                    width={width}
                    height={height}
                    url={url}
                    onDblClick={(e: any) => {
                        onDblClick?.(e)
                    }}
                />
            ): null}
            
        </>
    )
}

const ShapeWrap = ({
    shape,
    children,
    onChange,
    onClickConnectDown,
    onClickConnectUp,
}: ShapeParam) => {
    const { x, y, text = '', selectd = false } = shape
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
    const [isEditor, setIsEditor] = useState<boolean>(false)

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

    const editor = useEditor({
        x,
        y,
        text,
        visible: isEditor,
        height: shapeProps.height,
        width: shapeProps.width,
        onBlur: () => {
            setIsEditor(false)
        },
        onChange: (changeText) => {
            onChange?.({
                text: changeText
            })
        },
        onDblClick: () => {
            setIsEditor(true)
        }
    })
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
                shadowBlur: shapeProps.shadowBlur || 1
            })}
            {editor}
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
