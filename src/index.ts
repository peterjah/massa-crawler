import axios from "axios";
import { connectedNodes, nodeInfos } from "./types";

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6MappedIpv4Regex = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

const nodes: Record<string, nodeInfos> = {};

async function getNodeInfos(url: string): Promise<connectedNodes | undefined> {
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

    const nodeId = response.data.result.node_id;
    if (nodes[nodeId]) {
      nodes[nodeId].version = response.data.result.version;
      nodes[nodeId].routable = true;
    }
    return response.data.result.connected_nodes;
  } catch (error) {
    // console.error(
    //   `Error fetching connected nodes of ${url}:`,
    //   error?.toString()
    // );
  }
}

async function visitNode(url: string, nodeId?: string): Promise<void> {
  // do not revisit known node
  if (nodeId) {
    if (nodes[nodeId]) {
      return;
    } else {
      nodes[nodeId] = { url, version: undefined, routable: false };
    }
  }

  const connectedNodes = await getNodeInfos(url);

  if (!connectedNodes) {
    return;
  }

  await Promise.all(
    Object.entries(connectedNodes).map(async ([nodeId, connectionInfo]) => {
      const ip = connectionInfo[0] as string;
      const isIpv4 = ipv4Pattern.test(ip);
      const ipv6MappedMatch = ip.match(ipv6MappedIpv4Regex);

      const url = ipv6MappedMatch
        ? `http://${ipv6MappedMatch[1]}:33035`
        : isIpv4
        ? `http://${ip}:33035`
        : `http://[${ip}]:33035`;

      await visitNode(url, nodeId);
    })
  );
}

async function main() {
  const initialEndpoint = "https://mainnet.massa.net/api/v2";

  await visitNode(initialEndpoint);

  console.log(
    "\nNumber of known nodes in the network:",
    Object.keys(nodes).length
  );
  console.log(
    "Number of routables:",
    Object.values(nodes).filter((node) => node.routable).length
  );
  console.log(
    "Number of unreachable:",
    Object.values(nodes).filter((node) => !node.routable).length
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
