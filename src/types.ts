export type connectedNodes = {
  [key: string]: [string, number];
};

export type nodeInfos = {
  ips: string[];
  version?: string;
  routable: boolean;
  currentCycle?: number;
};
