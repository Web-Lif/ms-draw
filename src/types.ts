export type Direction = 'left' | 'right' | 'top' | 'bottom';

export interface ArrowPosition {
    id: string;
    junction: number;
}

export interface Arrow {
    id: string;
    source: ArrowPosition;
    target?: ArrowPosition | number[];
    state: 'finish' | 'draw';
    selectd?: boolean;
}

export interface Shape {
    id: string;
    x: number;
    y: number;
    height: number;
    width: number;
    type?: 'Circle';
    selectd?: boolean;
}

export interface DesignerData {
    arrows: Arrow[];
    shape: Shape[];
}
