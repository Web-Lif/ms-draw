---
nav:
    title: 设计器
    path: /components
---

## 绘图设计器

Demo:

```tsx
import React from 'react';
import { Designer } from 'ms-draw';

export default () => (
    <Designer
        style={{
            height: 500,
        }}
        data={[{
            className: 'Layer',
            attrs: {
                id: 'layer-0'
            },
            children: [{
                className: 'Circle',
                attrs: {
                    id: '0',
                    x: 100,
                    y: 100
                }
            }, {
                className: 'Circle',
                attrs: {
                    id: '1',
                    x: 500,
                    y: 200
                }
            },{
                className: 'Circle',
                attrs: {
                    id: '2',
                    x: 300,
                    y: 200
                }
            }]
        }]}
    />
);
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo
