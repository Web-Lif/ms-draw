import React, { FC, useEffect, useState, forwardRef } from 'react'
import { Image as KonvaImage } from 'react-konva'
import Konva from 'konva'


interface ImageProps extends Omit<Konva.ImageConfig, 'image'> {
    url: string
}

const Image: FC<ImageProps> = forwardRef<Konva.Image, ImageProps>(({
    url,
    ...restProps
}, ref) => {
    const [image, setImage] = useState<HTMLImageElement>()

    useEffect(() => {
        const img = new window.Image()
        img.src = url
        img.onload = () => {
            setImage(img)
        }
    }, [url])
    
    return (
        <KonvaImage
            ref={ref}
            image={image}
            {...restProps}
        />
    )
})

export default Image