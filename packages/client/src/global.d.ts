declare global {
  interface Window {
    cardano: {
      lace: {
        enable: () => Promise<LaceWalletApi>;
      };
    };
  }
}

// For this file to be treated as a module, we need to add this export
export {};
