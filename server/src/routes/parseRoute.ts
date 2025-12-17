// server/src/routes/parseRoute.ts
import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
// server/src/routes/parseRoute.ts
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY); // 👈 临时加这行
const router = Router();

router.post('/parse', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid input: message is required' });
  }

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: {
          messages: [
            {
              role: 'user',
              content: `你是一个 Web3 跨链助手。请将以下用户请求解析为 JSON 格式，只输出 JSON，不要任何解释。\n\n支持的操作：transfer\n支持的链：ethereum, bsc, polygon\n支持的资产：ETH, USDC, USDT\n\n输出格式：{"action":"transfer","token":"ETH","amount":"0.01","fromChain":"ethereum","toChain":"bsc"}\n\n用户输入：${message}`
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

    res.json(parsed);
  } catch (error: any) {
    console.error('Qwen API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 解析失败，请稍后再试' });
  }
});

export default router;