import { ethers } from "hardhat";

async function main() {
  const vault = await ethers.getContractAt(
    [
      "function nextPositionId() view returns (uint256)",
      "function getUserPositionIds(address) view returns (uint256[])",
      "function getUserPositions(address) view returns (tuple(uint256 id, address owner, address lpToken, uint256 lpAmount, uint256 receiptAmount, uint256 lockedAt, uint256 unlockAt, bool redeemed, bool exists)[])",
    ],
    "0x25D3B9fc6D449989925770a1950e0dbd3f286333"
  );

  const user = "0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb";
  const nextId = await vault.nextPositionId();
  const ids = await vault.getUserPositionIds(user);
  const positions = await vault.getUserPositions(user);

  console.log("nextPositionId:", nextId.toString());
  console.log("Position IDs:", ids.map((id: any) => id.toString()));
  console.log("Positions:", positions.length);
  positions.forEach((p: any, i: number) => {
    console.log(i, { lpToken: p.lpToken, lpAmount: p.lpAmount.toString(), redeemed: p.redeemed });
  });
}

main().catch(console.error);
