import React, { FC } from 'react';
import { Circle as RKCircle, Transformer } from 'react-konva';
import Konva from 'konva';

interface CircleProps {
    id: string;
    isSelected: boolean;
    width?: number;
    height?: number;
    onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
}

const Circle: FC<CircleProps> = ({
    id,
    isSelected,
    width = 100,
    height = 100,
    onClick,
}) => {
    const circleRef = React.useRef<Konva.Circle>(null);
    const trRef = React.useRef<Konva.Transformer>(null);

    React.useEffect(() => {
        if (isSelected) {
            trRef.current?.nodes([circleRef.current!]);
            trRef.current?.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <RKCircle
                id={id}
                ref={circleRef}
                draggable
                width={width}
                height={height}
                onClick={onClick}
                stroke="black"
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
