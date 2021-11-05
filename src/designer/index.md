---
nav:
    title: 设计器
    path: /components
---

## 绘图设计器

Demo:

```tsx
import React, { useState } from 'react';
import { Designer } from 'ms-draw';

export default () => {
    const [debug, setDebug] = useState<boolean>(false);
    const [data, setData] = useState({
        shape: [
            {
                type: 'Circle',
                id: '0',
                x: 200,
                y: 100,
                width: 100,
                height: 100
            },
            {
                type: 'Rect',
                id: '2',
                x: 0,
                y: 0,
                width: 500,
                height: 100,
                text: '你好呀，hahaha'
            },
            {
                type: 'Rhombus',
                id: '3',
                x: 400,
                y: 100,
                width: 80,
                height: 100,
            },
        ],
    });
    return (
        <>
            <button
                onClick={() => {
                    setDebug(!debug);
                }}
            >
                {debug ? '关闭调试' : '开启调试'}
            </button>

            <button
                onClick={() => {
                    console.log(data)
                }}
            >
                查看数据
            </button>
            <Designer
                debug={debug}
                style={{
                    height: 500,
                }}
                data={data}
                onChange={(changeData) => {
                    setData(changeData);
                }}
            />
        </>
    );
};
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo
