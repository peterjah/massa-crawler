export type connectedNodes = {
    [key: string]: (string | boolean)[];
  };
  
  export  type nodeInfos = {
    ips: string[];
    version?: string;
    routable: boolean;
    currentCycle?: number;
  }