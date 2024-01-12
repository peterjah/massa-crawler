import axios from "axios";

type connectedNodes = {
  [key: string]: (string | boolean)[];
};

async function fetchConnectedNodes(
  url: string
): Promise<connectedNodes | undefined> {
  try {
    console.log(`Fetching connected nodes from ${url}...`);
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

    const connectedNodes = response.data.result.connected_nodes;
    console.log(`found ${Object.keys(connectedNodes).length} connected nodes}`);

    return connectedNodes;
  } catch (error) {
    console.error(`Error fetching connected nodes of ${url}:`, error?.toString());
  }
}

async function crawlBlockchainNode(
  endpoint: string,
  visitedNodes: Set<string>
): Promise<{ routables: number; unreachable: number }> {
  if (visitedNodes.has(endpoint)) {
    return { routables: 0, unreachable: 0 }; // Avoid revisiting nodes
  }

  visitedNodes.add(endpoint);

  const connectedNodes = await fetchConnectedNodes(endpoint);

  let totalNodes = 1; // Count the current node
  let totalUnreachable = 0;

  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  if (connectedNodes) {
    await Promise.all(
      Object.values(connectedNodes).map(async (node) => {
        const ip = node[0] as string;
        const isIpv4 = ipv4Pattern.test(ip);

        const url = isIpv4 ? `http://${ip}:33035` : `http://[${ip}]:33035`;
        const { routables, unreachable } = await crawlBlockchainNode(
          url,
          visitedNodes
        );
        totalNodes += routables;
        totalUnreachable += unreachable;
      })
    );
  } else {
    totalUnreachable += 1;
  }
 
  return { routables: totalNodes, unreachable: totalUnreachable };
}

async function main() {
  const initialEndpoint = "https://mainnet.massa.net/api/v2";

  const { routables: totalNodes, unreachable } = await crawlBlockchainNode(
    initialEndpoint,
    new Set<string>()
  );

  console.log(`Total number of nodes in the network: ${totalNodes}`);
  console.log(`Number of unreachable: ${unreachable}`);

}

main();
