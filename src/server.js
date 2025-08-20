// This file should be created in the root of your project, next to your `src` folder.

// 1. Import necessary packages
const express = require("express");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("ethers");
require("dotenv").config(); // To read the .env file
const cors = require("cors");

// 2. Set up the server
const app = express();
app.use(express.json());
app.use(cors()); // Allows your React app to communicate with this server

// 3. --- CONFIGURATION ---
// These values will be read from your .env file for security
const PRIVATE_KEY = process.env.VITE_WALLET_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
const CLIENT_ID = process.env.VITE_TEMPLATE_CLIENT_ID;
// ** NEW: Get the Secret Key from the .env file **
const SECRET_KEY = process.env.VITE_THIRDWEB_SECRET_KEY;

// The direct URL for the Polygon Amoy network
const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";

// Check if all required environment variables are set
if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !CLIENT_ID || !SECRET_KEY) {
  console.error("❌ ERROR: Missing environment variables in your .env file.");
  console.error("Please ensure VITE_WALLET_PRIVATE_KEY, VITE_CONTRACT_ADDRESS, VITE_TEMPLATE_CLIENT_ID, and VITE_THIRDWEB_SECRET_KEY are set.");
  process.exit(1); // Stop the server if secrets are missing
}

// 4. Initialize the Thirdweb SDK on the backend
// This uses your secure "company wallet" to sign transactions
const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(AMOY_RPC_URL)
  ),
  {
    clientId: CLIENT_ID,
    // ** FIX: Add the secretKey here for backend permissions **
    secretKey: SECRET_KEY,
  }
);

// 5. Create the API endpoint that your React app will call to MINT
app.post("/mint", async (req, res) => {
  try {
    const { farmerName, weight } = req.body;
    console.log(`Received request to mint for: ${farmerName}, Weight: ${weight} KG`);

    const contract = await sdk.getContract(CONTRACT_ADDRESS);

    const metadata = {
      name: `Batch from ${farmerName}`,
      description: "A high-quality batch of organic cow dung.",
      image: "ipfs://bafkreihg53o5v2f2y2xj2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j/placeholder.png",
      properties: [
        { trait_type: "Weight (KG)", value: weight.toString() },
        { trait_type: "Origin", value: "Tindivanam Farms" },
      ],
    };

    const mintToAddress = await sdk.wallet.getAddress(); 
    const tx = await contract.erc721.mintTo(mintToAddress, metadata);
    const receipt = tx.receipt;
    const tokenId = tx.id.toString(); // Get the ID of the newly minted NFT
    const transactionHash = receipt.transactionHash;
    const url = `https://www.oklink.com/amoy/tx/${transactionHash}`;

    console.log(`✅ NFT Minted Successfully! Token ID: ${tokenId}, URL:`, url);
    res.status(200).json({ url: url, tokenId: tokenId });

  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    res.status(500).json({ error: "Failed to mint NFT. See server console for details." });
  }
});

// 6. --- NEW: API endpoint to UPDATE an existing NFT ---
// This is how you make the data "editable"
app.post("/update", async (req, res) => {
    try {
        const { tokenId, qualityScore } = req.body;
        console.log(`Received request to update Token ID: ${tokenId} with Quality Score: ${qualityScore}`);

        if (!tokenId || !qualityScore) {
            return res.status(400).json({ error: "Token ID and quality score are required." });
        }

        const contract = await sdk.getContract(CONTRACT_ADDRESS);

        // First, get the existing metadata of the NFT
        const nft = await contract.erc721.get(tokenId);
        const existingMetadata = { ...nft.metadata };

        // Add or update the quality score property
        // Note: 'properties' might be called 'attributes' depending on the standard
        if (!existingMetadata.properties) {
            existingMetadata.properties = [];
        }
        existingMetadata.properties.push({
            trait_type: "Quality Score (1-10)",
            value: qualityScore.toString(),
        });

        // Execute the update transaction
        const tx = await contract.erc721.updateMetadata(tokenId, existingMetadata);
        const transactionHash = tx.receipt.transactionHash;
        const url = `https://www.oklink.com/amoy/tx/${transactionHash}`;

        console.log(`✅ NFT Updated Successfully! URL:`, url);
        res.status(200).json({ url: url });

    } catch (error) {
        console.error("❌ Error updating NFT:", error);
        res.status(500).json({ error: "Failed to update NFT. See server console for details." });
    }
});


// 7. Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on http://localhost:${PORT}`);
});
