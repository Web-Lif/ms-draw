import React, { cloneElement, useRef, useEffect, useState, forwardRef } from 'react';
import { Transformer, Circle, Group, Rect } from 'react-konva';
import Konva from 'konva';
import shortid from 'shortid';
import { Html } from '../utils/konva'
import styled from 'styled-components'

import { getConnectPoint } from '../utils/connect';
import { Shape } from '../types'

const EditorStyle = styled.div`
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    outline: none;
    > div {
        padding: 0px 10%;
        box-sizing: border-box;
        outline: none;
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
        [name: string]: any
    }) => void;
    children: JSX.Element;
    onClickConnectDown?: (id: string, index: number) => void;
    onClickConnectUp?: (id: string, index: number) => void;
}



function setEndOfContenteditable(contentEditableElement: Element) {
    let range,selection;
    if(document.createRange) {
        range = document.createRange()
        range.selectNodeContents(contentEditableElement)
        range.collapse(false)
        selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
    }
}

interface EditorProps {
    shape: Shape
    text: string,
    visible: boolean,
    onChange?: (text: string) => void
    onBlur?: () => void
    onDblClick?: () => void
}

const Editor = forwardRef<Konva.Group, EditorProps>(({
    shape,
    visible,
    onChange,
    onBlur,
    onDblClick
}, ref) => {
    const editRef = useRef<HTMLDivElement>(null)
    const editContentRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        if (visible) {
            editContentRef.current?.focus()
            setEndOfContenteditable(editContentRef.current!)
        }
    }, [visible])

    const divProps = {
        style: {
            position: 'absolute',
            display: 'flex',
        },
    }

    const groupProps = {
        x: shape.x,
        y: shape.y,
        height: shape.height,
        width: shape.width,
    }

    return (
        <>
            <Html
                ref={ref}
                groupProps={groupProps}
                divProps={divProps}
                transform={false}
                transformFunc={( attr) => ({
                    ...attr,
                    rotation: shape.transform?.rotation || 0
                })}
            >
                <EditorStyle
                    ref={editRef}
                    style={{
                        left: groupProps.x,
                        top: groupProps.y,
                        width: groupProps.width,
                        height: groupProps.height,
                        transform: `rotate(${shape.transform?.rotation || 0 }deg)`,
                        transformOrigin: 'left top'
                    }}
                    onBlur={() => {
                        onBlur?.()
                        onChange?.(editContentRef.current!.textContent!)
                    }}
                    onDoubleClick={() => {
                        onDblClick?.()
                    }}
                >
                    <div
                        ref={editContentRef}
                        suppressContentEditableWarning
                        tabIndex={-1}
                        contentEditable={visible}
                        style={{
                            maxWidth: groupProps.width,
                        }}
                    >
                        {shape.text}
                    </div>
                </EditorStyle>
            </Html>
        </>
    )
})

const ShapeWrap = ({
    shape,
    children,
    onChange,
    onClickConnectDown,
    onClickConnectUp,
}: ShapeParam) => {
    const { x, y, text = '', selectd = false } = shape
    const shapeProps = children.props;

    const shapeRef = useRef<Konva.Shape>(null)
    const groupRef = useRef<Konva.Group>(null)
    const transformerRef = useRef<Konva.Transformer>(null);
    const editorRef = useRef<Konva.Group>(null)
    const id = useRef<string>(shapeProps.id || shortid.generate());

    const [draggable, setDraggable] = useState<boolean>(true);
    const [isEditor, setIsEditor] = useState<boolean>(false)

    useEffect(() => {
        if (selectd && shapeRef.current) {
            transformerRef.current?.nodes([shapeRef.current]);
            transformerRef.current?.getLayer()?.batchDraw();
        }
    }, [selectd]);

    const [isHoverConnectPoint, setHoverConnectPoint] =
        useState<boolean>(false);

    let tPosition = transformerRef?.current?.position() 
    if (tPosition?.x === -100000000 && tPosition?.y === -100000000) {
        tPosition = {
            x,
            y
        }
    }

    const renderConnectPoint = (): { x: number; y: number }[] => {
        if (isHoverConnectPoint) {
            return getConnectPoint(shapeRef.current!);
        }
        return [];
    };

  
    return (
        <>
            <Editor
                ref={editorRef}
                shape={{
                    ...shape,
                    ...(tPosition || {})
                }}
                text={text}
                visible={isEditor}
                onBlur={() => {
                    setIsEditor(false)
                }}
                onChange={(changeText) => {
                    onChange?.({
                        text: changeText
                    })
                }}
                onDblClick={() => {
                    setIsEditor(true)
                }}
            />
            <Group
                x={x}
                y={y}
                ref={groupRef}
                name={id.current}
                draggable={draggable}
                key={`group-${id.current}`}
                onDragMove={(e) => {
                    const node = e.target
                    onChange({
                        x:  node.x(),
                        y:  node.y(),
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
                    rotation: shape.transform?.rotation,
                    shadowBlur: shapeProps.shadowBlur || 1
                })}
                <Transformer
                    visible={selectd}
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
                            transform: {
                                rotation: node.rotation()
                            },
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
                            transform: {
                                rotation: node.rotation()
                            },
                        })
                    }}
                />
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
        </>
    );
};

export default ShapeWrap;
