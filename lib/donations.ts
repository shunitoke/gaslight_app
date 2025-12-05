export type WalletInfo = {
  id: string;
  label: string;
  address: string;
};

export const WALLET_ADDRESSES: WalletInfo[] = [
  {
    id: 'ton',
    label: 'TON',
    address: 'UQB_oYK9egOO1V1pbqIklusCFwStX652kDopnlSUFfYJemnI'
  },
  {
    id: 'usdt-ton',
    label: 'USDT (TON)',
    address: 'UQCfBdwQTDCFLmwhX1cFPiUWzDdTpDqzBBsTKS6bGJPZiglC'
  },
  {
    id: 'usdt-erc20',
    label: 'USDT (ERC20)',
    address: '0x10704b9E8C9fEc676C329F019A0C9BC0D5Bb474A'
  },
  {
    id: 'usdt-sol',
    label: 'USDT (SOL)',
    address: 'AuFi57sgG1JGsZVHJHTaomj8dpjpnQAPKZv9G1Gao8ju'
  },
  {
    id: 'usdt-trc20',
    label: 'USDT (TRC20)',
    address: 'TRG9ReoAjTt1zy4EnfVbfHBmms8h4ssSCj'
  }
];

export const getQrImageUrl = (address: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(address)}`;

