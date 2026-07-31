import React, { createContext, useContext, useState } from 'react';

interface NetworkContextType {
  bannerHeight: number;
  setBannerHeight: (height: number) => void;
  isBannerVisible: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  bannerHeight: 0,
  setBannerHeight: () => {},
  isBannerVisible: false,
});

export const useNetworkBanner = () => useContext(NetworkContext);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [bannerHeight, setBannerHeightRaw] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const setBannerHeight = (height: number) => {
    setBannerHeightRaw(height);
    setIsBannerVisible(height > 0);
  };

  return (
    <NetworkContext.Provider value={{ bannerHeight, setBannerHeight, isBannerVisible }}>
      {children}
    </NetworkContext.Provider>
  );
}

