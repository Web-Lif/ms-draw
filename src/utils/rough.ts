import rough from 'roughjs';
import { Options } from 'roughjs/bin/core';

let generator = rough.generator();

const LCG = (seed: number) => () =>
  ((2 ** 31 - 1) & (seed = Math.imul(48271, seed))) / 2 ** 31;


// see https://github.com/excalidraw/excalidraw/pull/73
function withCustomMathRandom<T>(seed: number, cb: () => T): T {
    const random = Math.random;
    Math.random = LCG(seed);
    const result = cb();
    Math.random = random;
    return result;
  }
  

function toBase64Url(svg: SVGSVGElement) {
    const url = new XMLSerializer().serializeToString(svg);
    return `data:image/svg+xml;base64,${Buffer.from(url).toString('base64')}`;
}


export const getCircle = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);
    const rec = withCustomMathRandom(0, () => generator.ellipse(width / 2, height / 2, width - 10, height - 10, options))
    svg.appendChild(rc.draw(rec))
    return toBase64Url(svg);
};

export const getRect = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);

    const rec = withCustomMathRandom(0, () => generator.rectangle(5, 5, width - 10, height - 10, options))
    svg.appendChild(rc.draw(rec));
    return toBase64Url(svg);
}


export const getRhombus = (width: number, height: number, options?: Options) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);
    const rec = withCustomMathRandom(0, () => generator.path(`M${width / 2} 0 L${width} ${height / 2} L${width / 2 } ${height} L0 ${height/2} L${width / 2} 0`, options))
    svg.appendChild(rc.draw(rec));
    return toBase64Url(svg);
} 

