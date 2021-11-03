import rough from 'roughjs';

function toBase64Url(svg: SVGSVGElement) {
    const url = new XMLSerializer().serializeToString(svg);
    return `data:image/svg+xml;base64,${Buffer.from(url).toString('base64')}`;
}

export const getCircle = (width: number, height: number) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const rc = rough.svg(svg);
    svg.appendChild(rc.ellipse(width / 2, height / 2, width - 10, height - 10));
    return toBase64Url(svg);
};
