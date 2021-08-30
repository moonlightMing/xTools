# xTools

一个针对运维日常工作遇到的一些问题所做出的工具集。

- 定时维护的任务容易忘记，闲暇时间难以安排学习任务
- 远程密码量大复杂，写在文本里不安全，同时难以检索维护
- 运维的学习条目种类繁多，写了笔记回头想找找不到
- 修改配置时，帐号密码端口总要一条一条的拷贝替换，效率低下
- 所有记录的内容需要加锁

该工具可以解决以上的问题，并且所有记录的内容本地都会进行加密，可选云同步。

## 功能模块介绍

### 任务单

可以看作是TodoList+四象限管理法，每个板块都可以独立创建任务。不同板块间任务也可以拖拽转移，方便任务优先级下降后改动。点击每个板块右上方+号添加任务。

![任务单展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/taskList-1.png)

任务根据提醒方式分为以下三种

1. 不提醒，仅仅制定一些闲时计划，不提醒。
2. 提醒单次，比如临时的维护任务，需要在下午五点准时开始。为了不忘记，在某天某时提醒。
3. 循环提醒，提醒自己养成良好的习惯，或者每天/每周/每月的定期巡检任务。

![任务添加展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/taskList-2.png)

提醒默认为右下角小窗口提醒，勾选弹幕提醒后提醒方式会变为全屏无差别弹幕发送，谨慎勾选！

![弹幕提醒功能展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/biu-biu-biu-notify.png)

### 密码本

经常要处理一些关于内/外网测试服、测试数据库的相关信息。并且要把这些信息交付给对应的开发测试。为了便于管理写了比较通用的键值对存储管理功能。再次强调，本地存储的敏感信息均有加密处理，并且配合锁功能可以满足一定的安全需求。

右侧信息卡片列表中，每张卡片即为一项密码表单，单击表单项会拷贝值到剪贴板。卡片右上方拷贝按钮会拷贝整张卡片内容，方便信息交付，编辑按钮能修改该卡片的内容。

![密码本展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/passbook-1.png)

以树状结构存储密码信息，自行管理分类。添加文件夹会添加一个分支节点，添加项目则添加一个存储密码的卡片。

![添加密码表单展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/passbook-2.png)

需要删除则右键左侧列表项，如果该项下有子项目，则一并删除。

### 云文档

类似其他同类云文档软件的操作模式。开启自动同步后，每次保存将自动同步至云端。

![云文档展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/cloudoc-1.png)

### 多项剪贴板

ALT + Q键呼出/隐藏。第一行为当前剪贴板内容，ALT + 1 ~ 4键对应将剪贴板内容暂存至1 ~ 4行，暂存后F1 ~ F4键拷贝对应值。

![多项剪贴板](https://github.com/moonlightMing/xTools/blob/master/readmeImages/clipboard-1.png)

## 配置项

### 云同步

所有任务、密码、文档都可以自动同步至云端，需要提前申请云服务商对象存储空间，目前仅支持腾讯云OSS。

输入存储信息完毕后，点击验证，验证通过后自动同步选项将变为可用状态。

![云同步展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/cloudsync-1.png)

### 密码验证

开启验证后启动本软件需要输入密码，ALT + L键锁定，需再次输入密码解锁。

![密码验证展示](https://github.com/moonlightMing/xTools/blob/master/readmeImages/auth-1.png)

## 使用技术

本项目使用 Electron + Typescript 构建

- 目标平台：Windows
- 组件库：Ant Design、Bootstrap4
- 状态管理：Mobx
- 存储：lowdb