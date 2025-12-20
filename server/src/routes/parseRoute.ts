// server/src/routes/parseRoute.ts
import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
// server/src/routes/parseRoute.ts
const router = Router();

router.post('/parse', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid input: message is required' });
  }

  try {
    console.log('🚀 调用千问API，用户输入:', message);
    console.log('🔑 API Key:', process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置');
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: {
          messages: [
            {
              role: 'user',
              content: `你是一个 Web3 跨链助手。请将以下用户请求解析为严格符合指定格式的 JSON 对象，只输出 JSON，不要任何解释、注释或额外内容。

支持的操作：transfer  
支持的资产：ETH, USDC, USDT  
支持的链（包括测试网）：
- Ethereum Mainnet → "ethereum"
- Ethereum Sepolia → "sepolia"
- BSC Mainnet → "bsc"
- BSC Testnet → "bscTestnet"
- Polygon Mainnet → "polygon"
- Polygon Amoy Testnet → "polygonAmoy"
- ZetaChain Mainnet → "zetachain"
- ZetaChain Testnet → "zetaChainTestnet"

用户可能会使用链的常见名称（如 "ZetaChain Testnet" 或 "BSC Testnet"），请将其映射为上述对应的标准化标识符。

输出格式必须为：
{
  "action": "transfer",
  "token": "ETH",
  "amount": "0.001",
  "from": "zetaChainTestnet",
  "to": "bscTestnet"
}

注意：
- 字段名必须是 "action", "token", "amount", "from", "to"
- amount 必须是字符串类型
- token 必须是大写（如 ETH, USDC, USDT）
- from 和 to 必须使用上述标准化标识符（小驼峰或全小写，如 "zetaChainTestnet"）

用户输入：${message}`
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.output.choices[0].message.content.trim();
    console.log('✅ 千问API调用成功，原始响应:', content);
    let parsed;
    try {
      // 尝试提取 JSON（Qwen 有时会加 ```json ... ```）
      const jsonMatch = content.match(/```(?:json)?\s*({.*?})\s*```/s);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.json({ error: 'Qwen 返回非 JSON 格式', raw: content });
    }

    console.log('📤 返回给客户端的数据:', parsed);
    res.json(parsed);
  } catch (error: any) {
    console.error('Qwen API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 解析失败，请稍后再试' });
  }
});

export default router;