# @tecace系列

各式各样的工具包，提高开发效率 A wide variety of toolkits to improve development efficiency

## npm tags 约定
- latest 稳定版
- alpha 版本标记表示软件包处于早期开发阶段
- beta 版本标记表示软件包进入了稳定的测试阶段
- rc 候选版本

## npm包说明

| npm名称 | 说明 | 开发文件位置 |
| ----------------- | ----------------- | ----------------- | 
| @tecace/nest-consul | 基于consul官方的node-consul，封装nest-consul工具库，提供自动注册服务和健康检查功能 | nest-consul  |
| @tecace/nest-opentelemetry | 基于官方 openetelemetry系列 封装 nest-opentelemetry 工具，无侵入式劫持 controller/provider，提供装饰器手动劫持非 nestjs 代码、忽略采集，自动上报 traces 和 metrics | nest-opentelemetry  |
| @tecace/protos-manager | 多服务间的proto解决方案，通过npm或git进行管理，支持基于proto文件生成对应类型（包内proto文件是内部使用，如果需要请自行clone，放入proto文件，执行对应脚本） | protos-manager  |
| @tecace/ts-proto-batch | 批量转换proto file至typescript file | ts-proto-batch  |