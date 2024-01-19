export type connectedNodes = {
    [key: string]: (string | boolean)[];
  };
  
  export  type nodeInfos = {
    url: string
    version: string | undefined;
    routable: boolean;
  }