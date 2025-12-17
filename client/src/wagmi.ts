// client/src/wagmi.ts
import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, bsc, polygon, arbitrum, optimism],
  connectors: [injected()], // 仅 MetaMask
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});