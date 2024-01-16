# Massa Node Crawler

## Overview

This repository contains a node script designed to crawl the Massa blockchain network and count the number of running nodes. The Massa blockchain is a decentralized and community-driven blockchain that relies on a network of nodes to operate effectively. This crawler helps in providing insights into the network's health by counting the number of active nodes.

## Installation

Before you begin, ensure that you have Node.js and npm installed on your machine. You can download them from [https://nodejs.org/](https://nodejs.org/).

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/peterjah/massa-crawler
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd massa-crawler
   ```

3. **Install Dependencies:**

   ```bash
   npm install
   ```

## Usage

To run the Massa blockchain node crawler, follow these steps:

1. **Run the Crawler:**

   Execute the following command to start the crawler:

   ```bash
   npm run start
   ```

   This will initiate the crawler, and it will begin counting the number of running nodes on the Massa blockchain network.

3. **View Results:**

   Once the crawler completes its operation, the results will be displayed in the console. You can analyze the output to understand the current state of the Massa blockchain network.
      
    ```bash
    Number of known nodes in the network: 3083
    Number of routables: 1481
    Number of unreachable: 1602
    ```

## Contributing

If you would like to contribute to this project, feel free to open issues, create pull requests, or suggest improvements. Your feedback and contributions are highly appreciated.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
