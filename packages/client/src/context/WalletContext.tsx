import * as CardanoWasm from '@emurgo/cardano-serialization-lib-browser';
import { Buffer } from 'buffer';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

// Define Wallet API Interface
interface LaceWalletApi {
  getNetworkId: () => Promise<number>;
  getUtxos: () => Promise<string[]>;
  getUsedAddresses: () => Promise<string[]>;
  signTx: (txHex: string, partialSign: boolean) => Promise<string>;
  submitTx: (txHex: string) => Promise<string>;
}

// Define Context Interface
interface WalletContextType {
  api: LaceWalletApi | null;
  connected: boolean;
  networkId: number | null;
  connectLaceWallet: () => Promise<LaceWalletApi | null>;
  sendTransaction: (receiverAddress: string, amountADA: number) => Promise<void>;
  checkIfWalletHoldsNFT: (nftAddress: string) => Promise<boolean>; // New function to check for NFTs
}

// Create Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet Provider Props
interface WalletProviderProps {
  children: ReactNode;
}

// Wallet Provider Component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [api, setApi] = useState<LaceWalletApi | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // Connect to Lace Wallet
  const connectLaceWallet = useCallback(async (): Promise<LaceWalletApi | null> => {
    if (typeof window === 'undefined' || !window.cardano || !window.cardano.lace) {
      alert('Lace wallet not found!');
      return null;
    }

    try {
      const laceApi: LaceWalletApi = await window.cardano.lace.enable();
      const network_id = await laceApi.getNetworkId();

      // if (networkId !== 1) {
      //   alert('Please switch to Cardano mainnet.');
      //   return null;
      // }

      setNetworkId(network_id);

      setApi(laceApi);
      setConnected(true);
      return laceApi;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return null;
    }
  }, []);

  // Send ADA Transaction
  const sendTransaction = useCallback(
    async (receiverAddress: string, amountADA: number): Promise<void> => {
      if (!api) {
        alert('Wallet not connected. Please connect first.');
        return;
      }

      try {
        const rawUtxos: string[] = await api.getUtxos();
        const utxos = rawUtxos.map((utxo) => CardanoWasm.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, 'hex')));

        const txBuilder = CardanoWasm.TransactionBuilder.new(
          CardanoWasm.TransactionBuilderConfigBuilder.new()
            .fee_algo(
              CardanoWasm.LinearFee.new(CardanoWasm.BigNum.from_str('44'), CardanoWasm.BigNum.from_str('155381')),
            )
            .coins_per_utxo_byte(CardanoWasm.BigNum.from_str('34482'))
            .key_deposit(CardanoWasm.BigNum.from_str('2000000'))
            .pool_deposit(CardanoWasm.BigNum.from_str('500000000'))
            .max_tx_size(16384)
            .max_value_size(5000)
            .build(),
        );

        // Add UTXOs as inputs
        utxos.forEach((utxo) =>
          txBuilder.add_regular_input(utxo.output().address(), utxo.input(), utxo.output().amount()),
        );

        // Add receiver address
        const minAda = CardanoWasm.BigNum.from_str((amountADA * 1_000_000).toString());
        const address = CardanoWasm.Address.from_bech32(receiverAddress);
        txBuilder.add_output(CardanoWasm.TransactionOutput.new(address, CardanoWasm.Value.new(minAda)));

        // Add change address (back to sender)
        const usedAddresses: string[] = await api.getUsedAddresses();
        if (usedAddresses.length === 0) {
          alert('No used addresses found in wallet.');
          return;
        }
        const senderAddress = CardanoWasm.Address.from_bytes(Buffer.from(usedAddresses[0], 'hex'));
        txBuilder.add_change_if_needed(senderAddress);

        // Finalize and sign transaction
        const txBody = txBuilder.build();
        const transaction = CardanoWasm.Transaction.new(txBody, CardanoWasm.TransactionWitnessSet.new());

        const txHex = Buffer.from(transaction.to_bytes()).toString('hex');
        const signedTx = await api.signTx(txHex, true);
        const txHash = await api.submitTx(signedTx);

        console.log('Transaction submitted:', txHash);
        alert(`Transaction sent! Tx Hash: ${txHash}`);
      } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed!');
      }
    },
    [api],
  );

  const utxoDetail = (utxo: CardanoWasm.TransactionUnspentOutput) => {
    const output = utxo.output();
    const address = output.address().to_bech32();
    const amount = output.amount().coin().to_str(); // ADA value in lovelace

    // Extract native tokens (if available)
    const multiAsset = output.amount().multiasset();
    const assets = [];
    if (multiAsset) {
      const policyIds = multiAsset.keys();
      for (let i = 0; i < policyIds.len(); i++) {
        const policyId = policyIds.get(i);
        const assetsList = multiAsset.get(policyId);
        if (!assetsList) continue;
        const assetNames = assetsList.keys();

        for (let j = 0; j < assetNames.len(); j++) {
          const assetName = assetNames.get(j);
          const quantity = assetsList.get(assetName)?.to_str();
          assets.push({
            policyId: Buffer.from(policyId.to_bytes()).toString('hex'),
            assetName: Buffer.from(assetName.name()).toString('utf8'),
            quantity,
          });
        }
      }
    }

    // Extract Transaction Hash and Index
    const input = utxo.input();
    const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
    const txIndex = input.index();

    return {
      address,
      amount,
      assets,
      txHash,
      txIndex,
    };
  };

  const checkIfWalletHoldsNFT = useCallback(
    async (nftPolicyId: string): Promise<boolean> => {
      if (!api) {
        alert('Wallet not connected. Please connect first.');
        return false;
      }

      try {
        const rawUtxos: string[] = await api.getUtxos();

        const utxos = rawUtxos.map((utxo) => CardanoWasm.TransactionUnspentOutput.from_bytes(Buffer.from(utxo, 'hex')));
        console.log('rawUtxos', utxos);

        // Look through UTXOs and check if the NFT address exists
        for (const utxo of utxos) {
          // const outputAddress = utxo.output().address().to_bech32();

          const utxo_detail = utxoDetail(utxo);
          console.log(utxo_detail);

          if (utxo_detail?.assets?.find((v) => v.policyId === nftPolicyId)) return true;
        }

        return false;
      } catch (error) {
        console.error('Error checking for NFT:', error);
        return false;
      }
    },
    [api],
  );

  return (
    <WalletContext.Provider
      value={{ api, connected, networkId, connectLaceWallet, sendTransaction, checkIfWalletHoldsNFT }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom Hook to use Wallet Context
export const useLaceWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useLaceWallet must be used within a WalletProvider');
  }
  return context;
};
