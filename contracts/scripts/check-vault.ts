import { ethers } from "hardhat";

async function main() {
  const vault = await ethers.getContractAt(
    [
      "function getUserPositions(address user) view returns (tuple(address owner, address lpToken, uint256 lpAmount, uint256 receiptAmount, uint256 depositedAt, uint256 unlockAt, bool redeemed)[])",
      "function getUserPositionIds(address user) view returns (uint256[])",
      "function nextPositionId() view returns (uint256)",
    ],
    "0xf73E71b16494F88E56C6176fc7968033Af0bbC96"
  );

  const user = "0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb";
  const ids = await vault.getUserPositionIds(user);
  const positions = await vault.getUserPositions(user);
  const nextId = await vault.nextPositionId();

  console.log("Next position ID:", nextId.toString());
  console.log("Position IDs:", ids.map((id: any) => id.toString()));
  console.log("Positions count:", positions.length);
  positions.forEach((p: any, i: number) => {
    console.log(i, {
      lpToken: p.lpToken,
      lpAmount: p.lpAmount.toString(),
      redeemed: p.redeemed,
    });
  });
}

main().catch(console.error);
