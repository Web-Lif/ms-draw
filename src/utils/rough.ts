import rough from 'roughjs';
import { Options } from 'roughjs/bin/core';

function toBase64Url(svg: SVGSVGElement) {
    const url = new XMLSerializer().serializeToString(svg);
    return `data:image/svg+xml;base64,${Buffer.from(url).toString('base64')}`;
}

export const getCircle = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);
    svg.appendChild(rc.ellipse(width / 2, height / 2, width - 10, height - 10, options));
    return toBase64Url(svg);
};

export const getRect = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);
    svg.appendChild(rc.rectangle(5, 5, width - 10, height - 10, options));
    return toBase64Url(svg);
}


export const getRhombus = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);

    svg.appendChild(rc.path(`M${width / 2} 0 L${width} ${height / 2} L${width / 2 } ${height} L0 ${height/2} L${width / 2} 0  `, options));
    return toBase64Url(svg);
} 

