import Konva from 'konva';
import React, { forwardRef, PropsWithChildren, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import { Group } from 'react-konva';

const needForceStyle = (el: HTMLDivElement) => {
    const pos = window.getComputedStyle(el).position;
    const ok = pos === 'absolute' || pos === 'relative';
    return !ok;
};

type TransformAttrs = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    skewX: number;
    skewY: number;
};

type Props = PropsWithChildren<{
    groupProps?: Konva.ContainerConfig;
    divProps?: any;
    transform?: boolean;
    transformFunc?: (attrs: TransformAttrs) => TransformAttrs;
}>;

export const Html = forwardRef<Konva.Group, Props>(({
    children,
    groupProps,
    divProps,
    transform,
    transformFunc,
}, ref) => {
    const groupRef = React.useRef<Konva.Group>(null);
    const container = React.useRef<HTMLDivElement>();

    useImperativeHandle(ref, () => groupRef.current!)

    const shouldTransform = transform ?? true;

    const handleTransform = () => {
        const div = container.current;
        if (!div) {
            return;
        }

        if (shouldTransform && groupRef.current) {
            const tr = groupRef.current.getAbsoluteTransform();
            let attrs = tr.decompose();
            if (transformFunc) {
                attrs = transformFunc(attrs);
            }
            div.style.position = 'absolute';
            div.style.zIndex = '10';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
            div.style.transformOrigin = '50%';
        } else {
            div.style.position = '';
            div.style.zIndex = '';
            div.style.top = '';
            div.style.left = '';
            div.style.transform = ``;
            div.style.transformOrigin = '';
        }
        const { style, ...restProps } = divProps || {};
        // apply deep nesting, because direct assign of "divProps" will overwrite styles above
        Object.assign(div.style, style);
        Object.assign(div, restProps);
    };

    React.useLayoutEffect(() => {
        const group = groupRef.current;
        if (!group) {
            return;
        }
        const parent = group.getStage()?.container();
        if (!parent) {
            return;
        }


        let div = document.createElement('div');
        container.current = div;
        parent.children[0].appendChild(div);

        if (shouldTransform && needForceStyle(parent)) {
            parent.style.position = 'relative';
        }

        group.on('absoluteTransformChange', handleTransform);
        handleTransform();
        return () => {
            group.off('absoluteTransformChange', handleTransform);
            ReactDOM.unmountComponentAtNode(div);
            div.parentNode?.removeChild(div);
        };
    }, [shouldTransform]);

    React.useLayoutEffect(() => {
        handleTransform();
    }, [divProps]);

    React.useLayoutEffect(() => {
        ReactDOM.render(children as any, container.current!);
    });

    return <Group ref={groupRef} {...groupProps} />;
})
