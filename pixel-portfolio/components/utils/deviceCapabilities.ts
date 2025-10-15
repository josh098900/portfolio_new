import React from 'react';

/**
 * Device capability detection utility for optimizing 3D model loading
 * Based on hardware specs, network conditions, and user preferences
 */

export interface DeviceCapabilities {
  isHighPerformance: boolean;
  hasGoodConnection: boolean;
  supportsWebGL: boolean;
  memoryLevel: 'low' | 'medium' | 'high';
  networkType: string;
  shouldLoad3D: boolean;
}

export interface NetworkInfo {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Detects device performance capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Default capabilities for server-side rendering
  if (typeof window === 'undefined') {
    return {
      isHighPerformance: false,
      hasGoodConnection: false,
      supportsWebGL: false,
      memoryLevel: 'medium',
      networkType: 'unknown',
      shouldLoad3D: false,
    };
  }

  const capabilities: DeviceCapabilities = {
    isHighPerformance: detectHighPerformance(),
    hasGoodConnection: detectGoodConnection(),
    supportsWebGL: detectWebGLSupport(),
    memoryLevel: detectMemoryLevel(),
    networkType: detectNetworkType(),
    shouldLoad3D: false,
  };

  // Determine if 3D model should be loaded based on all factors
  capabilities.shouldLoad3D = shouldLoad3DModel(capabilities);

  return capabilities;
}

/**
 * Detects if device has high performance capabilities
 */
function detectHighPerformance(): boolean {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check if it's likely a mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // High performance criteria:
  // - Desktop with 4+ cores and 4GB+ RAM
  // - Mobile with 6+ cores and 6GB+ RAM
  if (isMobile) {
    return cores >= 6 && memory >= 6;
  } else {
    return cores >= 4 && memory >= 4;
  }
}

/**
 * Detects network connection quality
 */
function detectGoodConnection(): boolean {
  const connection = (navigator as any).connection;
  
  if (!connection) {
    // Assume good connection if API not available
    return true;
  }

  const networkInfo: NetworkInfo = {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };

  // Don't load 3D if user has data saver enabled
  if (networkInfo.saveData) {
    return false;
  }

  // Check effective connection type
  if (networkInfo.effectiveType === '4g') {
    return true;
  }

  // Check downlink speed (Mbps) and round-trip time (ms)
  if (networkInfo.downlink && networkInfo.rtt) {
    return networkInfo.downlink >= 1.5 && networkInfo.rtt <= 300;
  }

  // Default to false for slower connections
  return networkInfo.effectiveType === '3g';
}

/**
 * Detects WebGL support
 */
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Detects device memory level
 */
function detectMemoryLevel(): 'low' | 'medium' | 'high' {
  const memory = (navigator as any).deviceMemory;
  
  if (!memory) {
    // Estimate based on other factors
    const cores = navigator.hardwareConcurrency || 2;
    if (cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
  }

  if (memory <= 2) return 'low';
  if (memory <= 4) return 'medium';
  return 'high';
}

/**
 * Detects network connection type
 */
function detectNetworkType(): string {
  const connection = (navigator as any).connection;
  return connection?.effectiveType || 'unknown';
}

/**
 * Determines if 3D model should be loaded based on all capabilities
 */
function shouldLoad3DModel(capabilities: DeviceCapabilities): boolean {
  // Must have WebGL support
  if (!capabilities.supportsWebGL) {
    return false;
  }

  // Don't load on very low-end devices
  if (capabilities.memoryLevel === 'low' && !capabilities.isHighPerformance) {
    return false;
  }

  // Don't load on poor connections
  if (!capabilities.hasGoodConnection) {
    return false;
  }

  // Load on high-performance devices with good connections
  if (capabilities.isHighPerformance && capabilities.hasGoodConnection) {
    return true;
  }

  // Load on medium devices with excellent connections (4G)
  if (capabilities.memoryLevel === 'medium' && capabilities.networkType === '4g') {
    return true;
  }

  // Default to false for safety
  return false;
}

/**
 * Hook for using device capabilities in React components
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities>(() => 
    detectDeviceCapabilities()
  );

  React.useEffect(() => {
    // Re-detect capabilities when network changes
    const connection = (navigator as any).connection;
    
    if (connection) {
      const handleNetworkChange = () => {
        setCapabilities(detectDeviceCapabilities());
      };

      connection.addEventListener('change', handleNetworkChange);
      
      return () => {
        connection.removeEventListener('change', handleNetworkChange);
      };
    }
    return undefined;
  }, []);

  return capabilities;
}