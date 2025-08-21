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
const SECRET_KEY = process.env.VITE_THIRDWEB_SECRET_KEY;

// The direct URL for the Polygon Amoy network
const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";

// Check if all required environment variables are set
if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !CLIENT_ID || !SECRET_KEY) {
  console.error("❌ ERROR: Missing environment variables in your .env file.");
  process.exit(1);
}

// 4. Initialize the Thirdweb SDK on the backend
const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(AMOY_RPC_URL)
  ),
  {
    clientId: CLIENT_ID,
    secretKey: SECRET_KEY,
  }
);

// 5. API endpoint to MINT a new batch
app.post("/mint", async (req, res) => {
  try {
    const { farmerName, weight, latitude, longitude } = req.body;
    console.log(`Minting for: ${farmerName}, Weight: ${weight}, Location: ${latitude},${longitude}`);

    const contract = await sdk.getContract(CONTRACT_ADDRESS);

    // Start with the base properties
    const properties = [
        { trait_type: "Weight (KG)", value: weight.toString() },
        { trait_type: "Origin", value: "Tindivanam Farms" },
        { trait_type: "Registration Timestamp", value: new Date().toLocaleString("en-IN") },
    ];

    // ** FIX: Only add location properties if they exist **
    if (latitude && longitude) {
        properties.push({ trait_type: "Latitude", value: latitude.toString() });
        properties.push({ trait_type: "Longitude", value: longitude.toString() });
    }

    const metadata = {
      name: `Batch from ${farmerName}`,
      description: "A high-quality batch of organic cow dung.",
      image: "ipfs://bafkreihg53o5v2f2y2xj2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j/placeholder.png",
      properties: properties, // Use the new properties array
    };

    const mintToAddress = await sdk.wallet.getAddress(); 
    const tx = await contract.erc721.mintTo(mintToAddress, metadata);
    const tokenId = tx.id.toString();
    const transactionHash = tx.receipt.transactionHash;
    const url = `https://www.oklink.com/amoy/tx/${transactionHash}`;

    console.log(`✅ NFT Minted! Token ID: ${tokenId}`);
    res.status(200).json({ url: url, tokenId: tokenId });

  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    res.status(500).json({ error: "Failed to mint NFT." });
  }
});

// 6. --- NEW: API endpoint to UPDATE an existing NFT (Add a checkpoint) ---
app.post("/update", async (req, res) => {
    try {
        const { tokenId, checkpointLocation } = req.body;
        console.log(`Updating Token ID: ${tokenId} with checkpoint: ${checkpointLocation}`);

        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const nft = await contract.erc721.get(tokenId);
        const existingMetadata = { ...nft.metadata };

        if (!existingMetadata.properties) {
            existingMetadata.properties = [];
        }
        
        // Add the new checkpoint as a property
        existingMetadata.properties.push({
            trait_type: `Checkpoint: ${checkpointLocation}`,
            value: new Date().toLocaleString("en-IN"),
        });

        const tx = await contract.erc721.updateMetadata(tokenId, existingMetadata);
        const url = `https://www.oklink.com/amoy/tx/${tx.receipt.transactionHash}`;

        console.log(`✅ NFT Updated!`);
        res.status(200).json({ url: url });

    } catch (error) {
        console.error("❌ Error updating NFT:", error);
        res.status(500).json({ error: "Failed to update NFT." });
    }
});

// 7. API endpoint to GET all batches
app.get("/get-batches", async (req, res) => {
    try {
        console.log("Received request to get all batches.");

        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const ownerAddress = await sdk.wallet.getAddress();
        
        // ** FIX: Using a more reliable method to fetch NFTs **
        // First, get all NFTs in the collection
        const allNfts = await contract.erc721.getAll();
        // Then, filter them to find the ones owned by our server's wallet
        const nfts = allNfts.filter(nft => nft.owner.toLowerCase() === ownerAddress.toLowerCase());

        const batchDetails = nfts.map(nft => ({
            id: nft.metadata.id,
            name: nft.metadata.name,
            properties: nft.metadata.properties,
        }));
        
        console.log(`✅ Found ${batchDetails.length} batches.`);
        res.status(200).json(batchDetails);
    } catch (error) {
        console.error("❌ Error fetching NFTs:", error);
        res.status(500).json({ error: "Failed to fetch batches." });
    }
});

// 8. Start the server
const PORT = process.env.PORT || 3001; // Use Render's port if available
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});
