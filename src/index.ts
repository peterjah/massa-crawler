import axios from "axios";
import { connectedNodes, nodeInfos } from "./types";

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

const nodes: Record<string, nodeInfos> = {};

async function getNodeInfos(
  url: string
): Promise<connectedNodes | undefined> {
  let connectedNodes;
  let version;
  try {
    console.log(`Fetching infos from ${url}...`);
    const response = await axios.post(
      url,
      {
        jsonrpc: "2.0",
        method: "get_status",
        params: [[]],
        id: 1,
      },
      { timeout: 1000 }
    );
    connectedNodes = response.data.result.connected_nodes;
    version = response.data.result.version;
    return connectedNodes;
  } catch (error) {
    // console.error(
    //   `Error fetching connected nodes of ${url}:`,
    //   error?.toString()
    // );
  } finally {
    nodes[url] = { version, routable: !!version };
  }
}

async function visitNode(url: string): Promise<void> {
  // do not revisit known node
  if (nodes[url]) {
    return;
  }

  nodes[url] = { version: undefined, routable: false };

  const connectedNodes = await getNodeInfos(url);

  if (!connectedNodes) {
    return;
  }

  await Promise.all(
    Object.values(connectedNodes).map(async (node) => {
      const ip = node[0] as string;
      const isIpv4 = ipv4Pattern.test(ip);

      const url = isIpv4 ? `http://${ip}:33035` : `http://[${ip}]:33035`;
      await visitNode(url);
    })
  );
}

async function main() {
  const initialEndpoint = "https://mainnet.massa.net/api/v2";

  await visitNode(initialEndpoint);

  console.log(
    `Number of known nodes in the network: ${Object.keys(nodes).length}`
  );
  console.log(
    `Number of routables: ${
      Object.values(nodes).filter((node) => node.routable).length
    }`
  );
  console.log(
    `Number of unreachable: ${
      Object.values(nodes).filter((node) => !node.routable).length
    }`
  );

  let versions: Record<string, number> = {};
  for (const nodeInfo of Object.values(nodes)) {
    if (nodeInfo.version) {
      versions[nodeInfo.version]
        ? versions[nodeInfo.version]++
        : (versions[nodeInfo.version] = 1);
    }
  }
  console.log(`Versions:`, versions);
}

main();
