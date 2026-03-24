import express from "express";
import { AITierService } from "../services/aiTierService";
import { TBAService } from "../services/tbaService";

export function createRouter(aiTier: AITierService, tba: TBAService) {
  const router = express.Router();

  router.get("/tier/:address", async (req, res) => {
    try {
      const tier = await aiTier.getTier(req.params.address);
      res.json({ address: req.params.address, tier });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch tier" });
    }
  });

  router.get("/hasTier/:address/:requiredTier", async (req, res) => {
    try {
      const ok = await aiTier.hasTier(
        req.params.address,
        Number(req.params.requiredTier)
      );
      res.json({ ok });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to check tier" });
    }
  });

  router.post("/tba/create", async (req, res) => {
    try {
      const { tokenContract, tokenId, salt } = req.body;
      const account = await tba.getOrCreateAccount(tokenContract, tokenId, salt);
      res.json({ account });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create or fetch TBA" });
    }
  });

  return router;
}
