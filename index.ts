#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
// !!! ADDED IMPORT !!!
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"; // 导入 CallToolResult
import dotenv from 'dotenv'; // 导入 dotenv ，以便读取环境变量
dotenv.config(); // 调用 dotenv.config()
import crypto from 'node:crypto'; // 导入 crypto 模块，用于生成 session id

let currentSessionId: string | undefined; // 声明一个变量来存储当前的 session ID

// const APP_KEY = process.env.APP_KEY;
// const SECRET_KEY = process.env.SECRET_KEY;
const BASE_URL = process.env.BASE_URL;

// !!! ADDED API KEY !!!
const MCP_API_KEY = process.env.MCP_API_KEY; // 从环境变量中读取 API Key

// if (!APP_KEY || !SECRET_KEY) {
//     console.error("错误：环境变量 APP_KEY 和 SECRET_KEY 必须设置。");
//     process.exit(1);
// }


async function fetchInfo(path:string, name:string, sessionId?: string): Promise<CallToolResult> {
    const url = new URL(`${BASE_URL}${path}/${name}`);
    // Object.entries(queryParams).forEach(([key, value]) => {
    //     if (value !== undefined) {
    //         url.searchParams.set(key, value.toString());
    //     }
    // });
    // url.searchParams.set("appkey", APP_KEY);
    // url.searchParams.set("secret_key", SECRET_KEY);

    // !!! IMPORTANT: Add API Key to headers !!!
    const headers: HeadersInit = {
        'x-api-key': MCP_API_KEY || '', // 使用 MCP_API_KEY，如果为空则发送空字符串
        'X-MCP-Source': 'mcp-http', // 添加固定的 X-MCP-Source 头
        ...(sessionId && { 'npm-session-id': sessionId }), // 如果提供了 sessionId，则添加 npm-session-id 头
    };

    try {
        const res = await fetch(url.toString(), { headers }); // Pass headers to fetch
        const clonedRes = res.clone(); // 克隆响应，以便稍后读取原始文本
        let responseData: any;

        try {
            responseData = await res.json(); // 尝试解析 JSON
            return {
                content: [{ type: "text", text: JSON.stringify(responseData) }]
            };
        } catch (jsonError: any) {
            // 如果 JSON 解析失败，则使用克隆的响应读取原始文本
            const rawResponseText = await clonedRes.text().catch(() => `无法读取原始响应体: ${jsonError.message}`);
            return {
                content: [{ type: "text", text: `Error: Failed to parse JSON response from ${path}: ${jsonError.message}. Raw response: ${rawResponseText}` }],
                isError: true
            };
        }
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true
        };
    }
}
async function main() {
    const server = new McpServer({ name: "mcp-server",version: "1.0.0" });
    // 定义在服务器初始化完成后向外部服务器发送 GET 请求的函数
    async function sendOnInitMessage(sessionId: string) {
        const targetUrl = new URL('/npm-init', BASE_URL).toString(); // 使用 URL 构造函数安全拼接路径
        try {
            const headers: HeadersInit = {
                'X-MCP-Source': 'mcp-stdio', // 添加固定的 X-MCP-Source 头
                'mcp-session-id': sessionId, // 添加 session ID 头
            };
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: headers,
            });
            if (response.ok) {
                console.error(`Successfully sent GET request to: ${targetUrl}`);
            } else {
                console.error(`Failed to send GET request to ${targetUrl}: ${response.status} ${response.statusText}`);
            }
        } catch (error: any) {
            console.error(`Error sending GET request on init: ${error.message}`);
        }
    }

    // 当服务器完全初始化后（收到客户端的 'initialized' 通知），生成并记录 session id
    server.server.oninitialized = async () => {
        currentSessionId = crypto.randomUUID(); // 生成新的 session ID
        console.error(`MCP Server initialized. New session ID: ${currentSessionId}`);
        // 立即发送初始化 GET 请求
        await sendOnInitMessage(currentSessionId);
    };

    server.tool("company_name", "获取企业工商信息\n入参:\n    blur_name: 公司模糊名称。type:str\n出参:\n    推断的公司名称精确结果列表。这是因为用户提供的模糊名称关键字可能同时匹配多个公司名称。\n注意：\n    在入参包括公司名称的工具（工商信息、司法信息、风险信息等）被调用前，必须先调用此工具，然后根据用户的上下文，选择一个最合理的返回值，作为最终的公司名称输入结果。\n    掉用完成该接口后，请**自动选择**你认为最合适的结果，并作为参数再次调用用户要求的接口。",
        {burl_name: z.string().describe("企业相关关键字，输入字数>=2且不能仅输入\"公司\"或\"有限公司\""),}, async ({ burl_name}) => {
        return await fetchInfo("/company_name", burl_name, currentSessionId);
    });
    server.tool("basic_info", "获取企业工商信息\n入参:\n    company_name: 公司精确名称。type:str\n出参:\n    企业工商信息,包括企业状态、曾用名、法人、统一信用代码、成立日期、注册资金与币种、行业、企业类型、地址、经营范围、经营期限自、经营期限至、核准日期、登记机关、注销日期、吊销日期等字段。",
         { company_name: z.string().describe("公司精确名称") }, async ({ company_name }) => {
        return await fetchInfo("/basic_info", company_name, currentSessionId);
    });
    server.tool("judicial_info", "获取企业司法信息\n入参:\n    company_name: 公司精确名称。type:str\n出参:\n    企业司法信息,包括企业立案信息、法院公告、开庭公告、送达公告、执行信息、司法拍卖、破产信息等。",
        { company_name: z.string().describe("公司精确名称") }, async ({ company_name }) => {
        return await fetchInfo("/judicial_info", company_name, currentSessionId);
    });
    server.tool("risk_info", "获取企业风险信息\n入参:\n    company_name: 公司精确名称。type:str\n出参:\n    企业司法信息,包括企业经营异常风险、失信被执行人、工商严重违法、重大税收违法、欠税公告、限制高消费等。",
        { company_name: z.string().describe("公司精确名称") }, async ({ company_name }) => {
        return await fetchInfo("/risk_info", company_name, currentSessionId);
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Server is running..."); // MOVED from finally block, to indicate server is truly listening
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}); // REMOVED .finally() block since console.log was moved
