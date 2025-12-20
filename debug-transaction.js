// 调试脚本：检查 ZetaChain 交易
// 在浏览器控制台中运行此脚本来检查交易状态

async function debugZetaChainTransaction(txHash) {
  console.log('🔍 调试 ZetaChain 交易:', txHash);
  
  try {
    // 方法1: 使用 BlockScout API
    const blockscoutResponse = await fetch(
      `https://zetachain-athens-3.blockscout.com/api?module=transaction&action=gettxinfo&txhash=${txHash}`
    );
    
    if (blockscoutResponse.ok) {
      const data = await blockscoutResponse.json();
      console.log('📊 BlockScout API 响应:', data);
    } else {
      console.error('❌ BlockScout API 失败:', blockscoutResponse.status);
    }
    
    // 方法2: 直接检查交易
    const directResponse = await fetch(
      `https://zetachain-athens-3.blockscout.com/tx/${txHash}`
    );
    
    if (directResponse.ok) {
      const html = await directResponse.text();
      console.log('📄 页面加载成功，检查是否包含交易信息');
      
      if (html.includes('Transaction Details') || html.includes('Transaction Information')) {
        console.log('✅ 交易页面存在');
      } else {
        console.log('❌ 交易页面不存在或未找到交易');
      }
    } else {
      console.error('❌ 交易页面加载失败:', directResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 调试失败:', error);
  }
}

// 使用方法：
// 1. 复制交易哈希
// 2. 在浏览器控制台中运行: debugZetaChainTransaction("你的交易哈希")

// 示例：
debugZetaChainTransaction("0xCfBa7...a8a11");

console.log('🔧 ZetaChain 交易调试工具已加载');
console.log('💡 使用方法: debugZetaChainTransaction("你的交易哈希")');