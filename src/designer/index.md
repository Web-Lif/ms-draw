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
        data={{
            shape: [{
                type: 'Circle',
                id: '0',
                x: 200,
                y: 100,
                width: 100,
                height: 100
            }]
        }}
    />
);
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo
