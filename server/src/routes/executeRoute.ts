// server/src/routes/executeRoute.ts
import { Router } from 'express';

const router = Router();

router.post('/execute', (req, res) => {
  const { action, token, amount, fromChain, toChain } = req.body;

  console.log('🚀 后端收到跨链交易请求:', { action, token, amount, fromChain, toChain });
  console.log('📍 注意：当前版本已改为前端直接调用 ZetaChain 合约');

  // 返回提示信息，说明现在由前端直接处理
  res.json({
    success: false,
    message: '请使用前端直接执行跨链交易',
    note: '当前版本已升级为前端直接调用 ZetaChain 合约，无需通过后端',
    details: { action, token, amount, fromChain, toChain }
  });
});

export default router;