import { ethers } from "hardhat";

async function main() {
  const vault = await ethers.getContractAt(
    [
      "function getPosition(uint256 positionId) view returns (tuple(address owner, address lpToken, uint256 lpAmount, uint256 receiptAmount, uint256 depositedAt, uint256 unlockAt, bool redeemed))",
    ],
    "0xf73E71b16494F88E56C6176fc7968033Af0bbC96"
  );

  try {
    const pos = await vault.getPosition(0);
    console.log("Position 0:", {
      owner: pos.owner,
      lpToken: pos.lpToken,
      lpAmount: pos.lpAmount.toString(),
      redeemed: pos.redeemed,
    });
  } catch(e: any) {
    console.log("Error:", e.message);
  }
}

main().catch(console.error);
