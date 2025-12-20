// 测试 ZetaChain 交易监控改进
import { checkZetaChainTransaction } from './client/src/utils/zetaChainHelper.ts';

async function testTransactionMonitoring() {
  const testTxHash = '0x98ed3386de77c1414aa5def4fa1698b6374f1c713b32a8690379a04db7be6f2e';
  
  console.log('🧪 开始测试交易监控...');
  
  try {
    const result = await checkZetaChainTransaction(testTxHash);
    
    console.log('✅ 测试结果:', result);
    
    if (result.success) {
      console.log('🎉 交易监控成功！');
      console.log('- 状态:', result.status);
      console.log('- 区块:', result.blockNumber);
      console.log('- Gas 使用:', result.gasUsed);
      console.log('- 备用模式:', result.fallback || false);
      console.log('- 消息:', result.message);
    } else {
      console.log('❌ 交易监控失败:', result.message);
    }
  } catch (error) {
    console.error('💥 测试失败:', error);
  }
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  testTransactionMonitoring();
}

export { testTransactionMonitoring };