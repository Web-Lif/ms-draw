import React, { FC, useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import styled from 'styled-components';
import Konva from 'konva';

import Circle from './circle';

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid #ebedf1;
`;

interface DesignerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Designer: FC<DesignerProps> = ({ ...restProps }) => {
    const [size, setSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });

    const [select, setSelect] = useState<string | null>(null);

    const ref = useRef<HTMLDivElement>(null);

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

    return (
        <Container ref={ref} {...restProps}>
            <Stage
                width={size.width}
                height={size.height}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
            >
                <Layer>
                    <Circle
                        id="0"
                        isSelected={select === '0'}
                        onClick={(e) => {
                            setSelect(e.target.attrs.id);
                        }}
                    />
                </Layer>
            </Stage>
        </Container>
    );
};

export default Designer;
