const express = require("express");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("ethers");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PRIVATE_KEY = process.env.VITE_WALLET_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
const CLIENT_ID = process.env.VITE_TEMPLATE_CLIENT_ID;
const SECRET_KEY = process.env.VITE_THIRDWEB_SECRET_KEY;
const AMOY_RPC_URL = "https://rpc-amoy.polygon.technology/";

if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !CLIENT_ID || !SECRET_KEY) {
  console.error("❌ ERROR: Missing environment variables in your .env file.");
  process.exit(1);
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(AMOY_RPC_URL)
  ),
  { clientId: CLIENT_ID, secretKey: SECRET_KEY }
);

// --- Mock Farmer Database ---
const farmersDB = {
    "FARMER_001": { name: "Sarath", village: "Tindivanam" },
    "FARMER_002": { name: "Priya", village: "Chembarambakkam" },
};

// API endpoint to MINT a new batch (Farmer's Action)
app.post("/mint", async (req, res) => {
  try {
    const { farmerId, weight, cowBreed, feedType, latitude, longitude } = req.body;
    const farmer = farmersDB[farmerId];
    if (!farmer) {
        return res.status(404).json({ error: "Farmer ID not found." });
    }
    console.log(`Minting for: ${farmer.name} from ${farmer.village}`);

    const contract = await sdk.getContract(CONTRACT_ADDRESS);
    const properties = [
        { trait_type: "Farmer ID", value: farmerId },
        { trait_type: "Farmer Name", value: farmer.name },
        { trait_type: "Village", value: farmer.village },
        { trait_type: "Weight (KG)", value: weight.toString() },
        { trait_type: "Cow Breed", value: cowBreed },
        { trait_type: "Feed Type", value: feedType },
        { trait_type: "Latitude", value: latitude.toString() },
        { trait_type: "Longitude", value: longitude.toString() },
        { trait_type: "Registration Timestamp", value: new Date().toLocaleString("en-IN", { timeZone: 'Asia/Kolkata' }) },
        { trait_type: "Status", value: "Registered by Farmer" },
    ];
    const metadata = {
      name: `Batch from ${farmer.name}`,
      description: "A batch of organic cow dung registered on DungTrace.",
      image: "ipfs://bafkreihg53o5v2f2y2xj2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j2j/placeholder.png",
      properties: properties,
    };
    const mintToAddress = await sdk.wallet.getAddress(); 
    const tx = await contract.erc721.mintTo(mintToAddress, metadata);
    const tokenId = tx.id.toString();
    const url = `https://www.oklink.com/amoy/tx/${tx.receipt.transactionHash}`;
    console.log(`✅ NFT Minted! Token ID: ${tokenId}`);
    res.status(200).json({ url: url, tokenId: tokenId });
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    res.status(500).json({ error: "Failed to mint NFT." });
  }
});

// API endpoint to UPDATE an NFT (Collector's Action)
app.post("/update", async (req, res) => {
    try {
        const { tokenId, qualityScore, collectorName } = req.body;
        console.log(`Updating Token ID: ${tokenId} by Collector: ${collectorName}`);
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const nft = await contract.erc721.get(tokenId);
        const existingMetadata = { ...nft.metadata };
        if (!existingMetadata.properties) existingMetadata.properties = [];
        const statusIndex = existingMetadata.properties.findIndex(p => p.trait_type === "Status");
        if (statusIndex > -1) {
            existingMetadata.properties[statusIndex].value = "Verified by Collector";
        } else {
            existingMetadata.properties.push({ trait_type: "Status", value: "Verified by Collector" });
        }
        existingMetadata.properties.push({ trait_type: "Quality Score (1-10)", value: qualityScore.toString() });
        existingMetadata.properties.push({ trait_type: "Collector Name", value: collectorName });
        existingMetadata.properties.push({ trait_type: "Verification Timestamp", value: new Date().toLocaleString("en-IN", { timeZone: 'Asia/Kolkata' }) });
        const tx = await contract.erc721.updateMetadata(tokenId, existingMetadata);
        const url = `https://www.oklink.com/amoy/tx/${tx.receipt.transactionHash}`;
        console.log(`✅ NFT Updated!`);
        res.status(200).json({ url: url });
    } catch (error) {
        console.error("❌ Error updating NFT:", error);
        res.status(500).json({ error: "Failed to update NFT." });
    }
});

// API endpoint to GET all batches (Owner's Action)
app.get("/get-batches", async (req, res) => {
    try {
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const ownerAddress = await sdk.wallet.getAddress();
        const allNfts = await contract.erc721.getAll();
        const nfts = allNfts.filter(nft => nft.owner.toLowerCase() === ownerAddress.toLowerCase());
        const batchDetails = nfts.map(nft => ({
            id: nft.metadata.id,
            name: nft.metadata.name,
            properties: nft.metadata.properties,
        }));
        res.status(200).json(batchDetails);
    } catch (error) {
        console.error("❌ Error fetching NFTs:", error);
        res.status(500).json({ error: "Failed to fetch NFTs." });
    }
});

// --- NEW: API endpoint to GET PENDING batches (Collector's Action) ---
app.get("/get-pending-batches", async (req, res) => {
    try {
        const contract = await sdk.getContract(CONTRACT_ADDRESS);
        const ownerAddress = await sdk.wallet.getAddress();
        const allNfts = await contract.erc721.getAll();
        const nfts = allNfts.filter(nft => nft.owner.toLowerCase() === ownerAddress.toLowerCase());
        
        // Filter for NFTs that have the status "Registered by Farmer"
        const pendingBatches = nfts.filter(nft => {
            if (!nft.metadata.properties) return false;
            const statusProp = nft.metadata.properties.find(p => p.trait_type === "Status");
            return statusProp && statusProp.value === "Registered by Farmer";
        });

        const batchDetails = pendingBatches.map(nft => ({
            id: nft.metadata.id,
            name: nft.metadata.name,
            properties: nft.metadata.properties,
        }));
        
        console.log(`✅ Found ${batchDetails.length} pending batches.`);
        res.status(200).json(batchDetails);
    } catch (error) {
        console.error("❌ Error fetching pending NFTs:", error);
        res.status(500).json({ error: "Failed to fetch pending batches." });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});