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
    fillStyle?: string;
    fill?: string;
    type?: 'Circle' | 'Rect' | 'Rhombus' | 'Swimlane';
    text?: string
    transform?: {
        rotation: number
    } 
    selectd?: boolean;
    [name: string]: any
}

export interface DesignerData {
    arrows: Arrow[];
    shape: Shape[];
}
