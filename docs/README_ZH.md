# 一个简单的全栈ChatGPT web 应用

[![English badge](https://img.shields.io/badge/%E8%8B%B1%E6%96%87-English-blue)](../README.md)

使用你的OpenAI Key在你的服务器上部署ChatGPT应用。前端React，后端express，数据库mongoDB。

## Features：

1. 默认关闭上下文以节省token。你可以打开“Context”模式并设置对话的起始点。
   ![Context](https://user-images.githubusercontent.com/41911311/245662593-3980ff48-efb2-4479-a42d-16fa62fafc51.png)

2. 内置浏览功能，可用于网络搜索或直接输入URL [^1][^2]。
   ![Browse](https://user-images.githubusercontent.com/41911311/245662584-38710aab-17a2-4c21-885e-856142fc464a.png)

3. 当前账户的token使用情况[^3]。
 ![Usage](https://user-images.githubusercontent.com/41911311/245663449-3250f9d6-c85c-47ab-9592-c2a47b460693.png)

4. 自定义模板。
![Templates](https://user-images.githubusercontent.com/41911311/245662102-1d3ad122-a09b-4922-a32f-7bf253df3905.png)

5. 注册不同账户以保存对话历史和使用数据。

6. 一键导出或恢复你的历史数据。
![Export history](https://user-images.githubusercontent.com/41911311/245662097-e31049a5-eae8-4cc8-8e4a-1cf40e219d9a.png)

7. 其他：使用chatgpt api的stream mode以获得更好的体验；代码高亮显示；为对话自动生成标题（也可以自己重命名）等...

[^1]: 浏览功能当前不支持上下文。
[^2]: 浏览功能使用的是chatgpt-3.5。 
[^3]: token计算为估计值。

## 安装：

1. 确保您的机器上已安装Node.js和MongoDB。
   - 使用[NVM](https://github.com/nvm-sh/nvm)（Node版本管理器）安装Node.js。该项目使用的是Node v18.14.1版本。
   - 安装最新版本的[MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/)。
   
2. 克隆此仓库。

3. 安装依赖项。
   在`api`和`client`目录中都运行`npm i`。

4. 输入你的OpenAI密钥。
   在`api`目录中创建一个`.env`文件，并包含以下行：
    ```
    OPENAI_KEY=<你的密钥>
    ```
    你也可以直接将密钥写入`api/config.js`，尽管不建议这样做。
    你可以在`api/config.js`中设置运行此应用的端口号。 
    请确保`api/config.js`和`client/src/config.js`中的`production`属性都设置为`true`。

5. Build React应用。
    在`client`目录中运行`npm run build`，然后将build目录移动到`api`，使用
    ```
    mv build ../api/
    ```

6. 启动应用。
运行`node server.js`。如果需要在后台运行，你可以使用`nohup`或`pm2`等工具。

## 可能遇到的问题：

1. 确保你的MongoDB正在运行，且其URL与`api/config.js`中指定的一致。

2. 确保相应的服务器端口已打开。

## TODO：

- [ ] 添加对PDF或TXT文件分析的支持。

- [ ] 关闭stream模式。

- [ ] archive对话的恢复。

- [ ] 通过关键词搜索对话历史记录。

- [ ] 纠正tokens计算。

- [ ] 为browse模式实现上下文功能。

- [ ] 每个账户支持单独的OpenAI密钥。

- [ ] 创建桌面版本。

## 免责声明：

本项目为开源项目，作者出于练习目的开发。如果你想使用它，请自行对其安全性负责任。

