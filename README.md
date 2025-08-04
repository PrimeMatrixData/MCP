# 质数幻方-企业数据 MCP

使用质数幻方提供的企业信息洞察mcp工具，精准探查到目标企业的工商信息、经营资质、风险情况等等，为您的AI接入最新的企业数据，省去网络搜索费token、企业总是关联不对的烦恼。

根据法律法规要求，您需要从我们的官网注册后再使用mcp服务，官网链接 https://mcp.yidian.cn/ ,全部服务限时免费。

## **工具介绍**

质数幻方企业数据 MCP 提供了一系列简单易用的工具，帮助您快速获取企业信息：

### 1. 获取企业工商信息
- **函数名**：get_company_basic_info
- **入参**：company_name: 公司精确名称。type:str
- **出参**：企业工商信息,包括企业状态、曾用名、法人、统一信用代码、成立日期、注册资金与币种、行业、企业类型、地址、经营范围、经营期限自、经营期限至、核准日期、登记机关、注销日期、吊销日期等字段。

### 2. 获取企业司法信息
- **函数名**：get_company_judical_info
- **入参**：company_name: 公司精确名称。type:str
- **出参**：企业司法信息,包括企业立案信息、法院公告、开庭公告、送达公告、执行信息、司法拍卖、破产信息等。

### 3. 获取企业风险信息
- **函数名**：get_company_risk_info
- **入参**：company_name: 公司精确名称。type:str
- **出参**：企业司法信息,包括企业经营异常风险、失信被执行人、工商严重违法、重大税收违法、欠税公告、限制高消费等。
## **可适配平台**

- 本地IDE：trae、cherry studio等常见客户端。
- 通用Agent调用：minimax Agent、扣子空间等。

## **安装部署**

### **官网注册**

不论是选用何种部署方式，都需要先在官网注册来获取唯一的密钥。

- 点击质数官网https://mcp.yidian.cn/api-keys
- 注册登录，可选绑定微信、设置密码，方便下次登陆。
- 点击左上角的mcp产品，点击侧边栏的密钥
![alt text](img/image-1.png)
- 生成新秘钥，设置有意义的名称。
![alt text](img/image-2.png)
- 秘钥不论是否可见，可以直接点击密钥所在的位置来复制完整秘钥。或者是点击小眼睛展示，再从“一键使用”当中复制完整的json代码。
![alt text](img/image-3.png)

### **SSE版安装部署**

以trae为例

- 打开软件
- 打开聊天框（win系统快捷键Ctrl+U）
- 单击右上角齿轮，选择mcp-> 添加-> 手动添加

  <img src="img/image-4.png" alt="alt text" width="400">
- 
  <img src="img/image-5.png" alt="alt text" width="400">
- 将从官网复制的json代码填入如图所示的区域。需要保留最外层的"mcpServers"，不然会报错。
  <img src="img/image-6.png" alt="alt text" width="400">
- 点击确认，等待mcp工具连接成功。如果连接失败，请检查密钥是否正确，或者向我们反馈。
  <img src="img/image-7.png" alt="alt text" width="400">
- 在trae中新建智能体，调用工具，艾特智能体开始对话 ~ 
  <img src="img/image-8.png" alt="alt text" width="400">

### **STDIO版安装部署**

以本地下载为例

- 下载npm包
- 配置环境变量
- 将官网复制的json代码加入到客户端的配置文件（一般是xx.json）。

## **使用示例**

1. 查一下阿里巴巴的负责人
   a. 示例回复：

   <img src="img/image-9.png" alt="alt text" width="400">
2. 查一下中国黄金最近的风险情况。
   a. 示例回复：

   <img src="img/image-10.png" alt="alt text" width="400">