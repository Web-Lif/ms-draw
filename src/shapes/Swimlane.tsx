import React, { FC, ReactNode } from 'react'
import styled from 'styled-components'
import SplitPane from 'react-split-pane'

import { Html } from '../utils/konva'
import { Shape } from '../types'


const Container = styled.div`
    border: 2.5px solid #000;
    position: absolute;
    box-sizing: border-box;
`

const Content = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const Bars = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    > div {
        flex: 1;
        border-bottom: 2.5px solid #000;
        display: flex;
        align-items: stretch;
        > :first-child {
            writing-mode: vertical-lr;
            padding: 0px 1rem;
            text-align: center;
            border-right: 2.5px solid #000;
        }
        > :last-child {
            flex: 1;
        }
    }
    > :last-child {
        border-bottom: unset;
    }
`


const Title = styled.div`
    text-align: center;
    padding: .8rem 0px;
    border-bottom: 2.5px solid #000;
`



interface SwimlaneProps {
    shape: Shape,
    onChange?: (width: number, height: number) => void
}

const Swimlane: FC<SwimlaneProps> = ({
    shape
}) => {
    const bar: ReactNode[] = []

    for (let i=0; i < (shape.quantity || 3); i += 1) {
        bar.push(
            <div>
                <div> {i} </div>
                <div></div>
            </div>
        )
    }

    return (
        <Html
            groupProps={{
                width: shape.width,
                height: shape.height
            }}
            transform={false}
            transformFunc={( attr) => ({
                ...attr,
                rotation: shape.transform?.rotation || 0
            })}
        >
            <Container
                style={{
                    left: shape.x,
                    top: shape.y,
                    width: shape.width,
                    height: shape.height
                }}
            >
                
                <Content>
                    <Title>
                        {shape.text}
                    </Title>
                    <Bars>
                        {bar}
                    </Bars>
                </Content>
            </Container>
        </Html>
    )
}

export default Swimlane