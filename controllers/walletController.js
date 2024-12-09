import { db } from '../db/firebase.js';

export const getTotalCashWallet = async (req, res) => {
    try {
      const { uid } = req.user;
  
      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");
      const walletSnapshot = await walletDoc.get();
  
      if (!walletSnapshot.exists) {
        return res.status(404).json({ message: "Wallet document not found" });
      }
  
      const { totalCashWallet = 0 } = walletSnapshot.data();
  
      return res.status(200).json({ totalCashWallet });
    } catch (error) {
      console.error("Error fetching total cash wallet:", error);
      return res.status(500).json({ message: "Error fetching total cash wallet", error: error.message });
    }
};

  
export const getTotalDigitalPaymentWallet = async (req, res) => {
    try {
      const { uid } = req.user;
  
      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");
      const walletSnapshot = await walletDoc.get();
  
      if (!walletSnapshot.exists) {
        return res.status(404).json({ message: "Wallet document not found" });
      }
  
      const { totalDigitalPaymentWallet = 0 } = walletSnapshot.data();
  
      return res.status(200).json({ totalDigitalPaymentWallet });
    } catch (error) {
      console.error("Error fetching total digital payment wallet:", error);
      return res.status(500).json({ message: "Error fetching total digital payment wallet", error: error.message });
    }
};
  
  