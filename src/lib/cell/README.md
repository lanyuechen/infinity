### Cell Object

| 属性 | 描述 | 默认值 |
| --- | --- | --- |
| id | 组件实例id，对应于links中的id | 系统生成 |
| component | 组件id，多个组件实例可能对应一个组件 | - |
| type | 组件类型：COMPONENT / FUNCTION / VIEW | FUNCTION |
| input | 输入组件实例id数组 | [] |
| out | 输出组件实例id，COMPONENT类型组件 | undefined |
| name | 组件名称 | ƒ(x) |
| desc | 组件描述 | '' |
| x | 组件x坐标 | 0 |
| y | 组件y坐标 | 0 |
| body | type = COMPONENT 时 body为Cell实例数组; <br> type = FUNCTION 时 body 为 function | - |
| lastData | 组件上一次返回值 | undefined |
| clock | 组件时钟, 防止循环引用 | 0 |
| innerClock | type=COMPONENT时有效。组件内部时钟，防止循环引用 | 0 |

### Cell Json

```
Cell{
	id: uuid(),
	input: [],
	out: "3-1",
	component: "3",
	type: "COMPONENT",
	name,desc,
	x: undefined,
	y: undefined,
	body: [
		Cell{

		},
		Cell{

		},
		Cell{

		}
	]
}
```

```
{
	"from": "3",							//指针，指向根节点
	"components": {						//组件列表，存储所有组件结构
		"3": {								//组件id
			"type": "COMPONENT",		//组件类型
			"name": "组件3",				//名称
			"desc": "组件描述3",			//描述
			"input": [],					//type=COMPONENT，输入参数id，与links.input中id对应
			"output": "3-0",				//type=COMPONENT，输出id，与links.id对应
			"links": [					//子组件列表，用来表示子组件的关系
				{
					"id": "3-0",			//关系id，对应cell对象的实例id
					"input": ["3-1"],	//输入id
					"component": "0",	//组件id
					"x": 235,				//x坐标
					"y": 431				//y坐标
				},
				{
					"id": "3-1",
					"input": [],
					"component": "1",
					"x": 430,
					"y": 511
				}
			]
		},
		"0": {
			"type": "COMPONENT",
			"name": "组件0",
			"desc": "组件描述0",
			"input": ["0-0-0"],
			"output": "0-1",
			"links": [
				{
					"id": "0-0",
					"input": ["0-0-0"],
					"component": "1",
					"x": 257,
					"y": 126
				},
				{
					"id": "0-1",
					"input": ["0-0"],
					"component": "2",
					"x": 553,
					"y": 220
				}
			]
		},
		"1": {
			"type": "COMPONENT",
			"name": "组件1",
			"desc": "组件描述1",
			"body": "function(a) {return a * 2}"	//type=FUNCTION，函数体
		},
		"2": {
			"type": "COMPONENT",
			"name": "组件2",
			"desc": "组件描述2",
			"body": "function(a) {return a + 10}"
		}
	}
}
```