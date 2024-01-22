import axios, { AxiosResponse } from "axios";
import { connectedNodes, nodeInfos } from "./types";

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

const nodes: Record<string, nodeInfos> = {};

const initialEndpoint = "https://mainnet.massa.net/api/v2";

const fetchNodeStatus = async (url: string): Promise<AxiosResponse> =>
  axios.post(
    url,
    {
      jsonrpc: "2.0",
      method: "get_status",
      params: [[]],
      id: 1,
    },
    { timeout: 1000 }
  );

async function visitNode(ip: string, nodeId: string): Promise<void> {
  if (nodes[nodeId]) {
    const isKnownIp = nodes[nodeId].ips.some((knownIp) => knownIp === ip);
    if (isKnownIp || nodes[nodeId].routable) {
      // if node is already routable, we don't need to visit it again
      return;
    }
    nodes[nodeId].ips = nodes[nodeId].ips.concat(ip);
  } else {
    nodes[nodeId] = { ips: [ip], routable: false };
  }

  //console.log(`Visiting ${ip} nodeId: ${nodeId}`);

  const isIpv4 = ipv4Pattern.test(ip);
  const url = isIpv4 ? `http://${ip}:33035` : `http://[${ip}]:33035`;

  let connectedNodes: connectedNodes;
  try {
    const response = await fetchNodeStatus(url);
    nodes[nodeId].version = response.data.result.version;
    nodes[nodeId].currentCycle = response.data.result.current_cycle;
    nodes[nodeId].routable = true;
    connectedNodes = response.data.result.connected_nodes;
  } catch (error) {
    //console.log(`Error fetching connected nodes of ${url}:`, error?.toString());
    return;
  }

  await Promise.all(
    Object.entries(connectedNodes).map(async ([nodeId, connectionInfo]) => {
      const ip = connectionInfo[0];
      await visitNode(ip, nodeId);
    })
  );
}

async function main() {

  const response = await fetchNodeStatus(initialEndpoint);

  const initialIp = response.data.result.node_ip;
  const initialNodeId = response.data.result.node_id;
  await visitNode(initialIp, initialNodeId);

  console.log(
    "\nNumber of known nodeIds in the network:",
    Object.keys(nodes).length
  );
  console.log(
    "Number of routables nodes:",
    Object.values(nodes).filter((node) => node.routable).length
  );
  console.log(
    "Number of unreachable:",
    Object.values(nodes).filter((node) => !node.routable).length
  );

  let versions: Record<string, number> = {};
  for (const nodeInfo of Object.values(nodes)) {
    if (nodeInfo.version) {
      if (!versions[nodeInfo.version]) {
        versions[nodeInfo.version] = 0;
      }
      versions[nodeInfo.version]++;
    }
  }
  console.log(`Versions:`, versions);
}

console.log(`Start crawling network from `, initialEndpoint);
main();
