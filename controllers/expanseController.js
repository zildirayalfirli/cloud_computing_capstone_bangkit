import { db } from '../db/firebase.js';

export const getAllExpanses = async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userExpanseCollection = db.collection("users").doc(uid).collection("expanse");
    const snapshot = await userExpanseCollection.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No expanses found" });
    }

    const expanses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(expanses);
  } catch (error) {
    console.error("Error fetching all expanses:", error);
    res.status(500).json({ message: "Error fetching expanses", error: error.message });
  }
};

export const getExpanseById = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    if (!uid || !id) {
      return res.status(400).json({ message: "User ID and expanse ID are required" });
    }

    const userExpanseCollection = db.collection("users").doc(uid).collection("expanse");
    const doc = await userExpanseCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Expanse not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching expanse:", error);
    res.status(500).json({ message: "Error fetching expanse", error: error.message });
  }
};

export const createExpanse = async (req, res) => {
  try {
    const { date, amount, description, category, wallet } = req.body;
    const { uid } = req.user;

    if (!date || !amount || !description || !category || !wallet) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validWalletTypes = ["cash", "digital payment"];
    if (!validWalletTypes.includes(wallet)) {
      return res.status(400).json({ message: "Invalid wallet type. Allowed values are 'cash' or 'digital payment'." });
    }

    const expanseCollection = db.collection("users").doc(uid).collection("expanse");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const newExpanse = { date, amount: parseFloat(amount), description, category, wallet };
    const docRef = await expanseCollection.add(newExpanse);
    await docRef.update({ id: docRef.id });

    const walletSnapshot = await walletDoc.get();
    const existingWallet = walletSnapshot.exists
      ? walletSnapshot.data()
      : { totalIncomeCash: 0, totalIncomeDigitalPayment: 0, totalExpanseCash: 0, totalExpanseDigitalPayment: 0 };

    const totalIncomeCash = parseFloat(existingWallet.totalIncomeCash || 0);
    const totalIncomeDigitalPayment = parseFloat(existingWallet.totalIncomeDigitalPayment || 0);
    const totalExpanseCash = parseFloat(existingWallet.totalExpanseCash || 0);
    const totalExpanseDigitalPayment = parseFloat(existingWallet.totalExpanseDigitalPayment || 0);

    const updatedTotals = {
      totalIncomeCash,
      totalIncomeDigitalPayment,
      totalExpanseCash: wallet === "cash" ? totalExpanseCash + parseFloat(amount) : totalExpanseCash,
      totalExpanseDigitalPayment: wallet === "digital payment" ? totalExpanseDigitalPayment + parseFloat(amount) : totalExpanseDigitalPayment,
      totalCashWallet: totalIncomeCash - (wallet === "cash" ? totalExpanseCash + parseFloat(amount) : totalExpanseCash),
      totalDigitalPaymentWallet: totalIncomeDigitalPayment - (wallet === "digital payment" ? totalExpanseDigitalPayment + parseFloat(amount) : totalExpanseDigitalPayment),
    };

    await walletDoc.set(updatedTotals);

    res.status(201).json({ message: "Expense created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Error creating expense", error: error.message });
  }
};

export const updateExpanse = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { date, amount, description, category, wallet } = req.body;

    if (!date || !amount || !description || !category || !wallet) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validWalletTypes = ["cash", "digital payment"];
    if (!validWalletTypes.includes(wallet)) {
      return res.status(400).json({ message: "Invalid wallet type. Allowed values are 'cash' or 'digital payment'." });
    }

    const expanseCollection = db.collection("users").doc(uid).collection("expanse");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const expanseDoc = await expanseCollection.doc(id).get();

    if (!expanseDoc.exists) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const previousAmount = parseFloat(expanseDoc.data().amount);
    const previousWallet = expanseDoc.data().wallet;

    await expanseCollection.doc(id).set(
      { id, date, amount: parseFloat(amount), description, category, wallet },
      { merge: true }
    );

    const walletSnapshot = await walletDoc.get();
    const existingWallet = walletSnapshot.exists
      ? walletSnapshot.data()
      : { totalIncomeCash: 0, totalIncomeDigitalPayment: 0, totalExpanseCash: 0, totalExpanseDigitalPayment: 0 };

    const updatedTotals = { ...existingWallet };

    updatedTotals[previousWallet === "cash" ? "totalExpanseCash" : "totalExpanseDigitalPayment"] -= previousAmount;

    updatedTotals[wallet === "cash" ? "totalExpanseCash" : "totalExpanseDigitalPayment"] += parseFloat(amount);

    updatedTotals.totalCashWallet = updatedTotals.totalIncomeCash - updatedTotals.totalExpanseCash;
    updatedTotals.totalDigitalPaymentWallet =
      updatedTotals.totalIncomeDigitalPayment - updatedTotals.totalExpanseDigitalPayment;

    await walletDoc.set(updatedTotals);

    res.status(200).json({ message: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Error updating expense", error: error.message });
  }
};

export const deleteExpanse = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const expanseCollection = db.collection("users").doc(uid).collection("expanse");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const expanseDoc = await expanseCollection.doc(id).get();

    if (!expanseDoc.exists) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const { amount, wallet } = expanseDoc.data();

    await expanseCollection.doc(id).delete();

    const walletSnapshot = await walletDoc.get();
    const existingWallet = walletSnapshot.exists
      ? walletSnapshot.data()
      : { totalIncomeCash: 0, totalIncomeDigitalPayment: 0, totalExpanseCash: 0, totalExpanseDigitalPayment: 0 };

    const updatedTotals = { ...existingWallet };

    updatedTotals[wallet === "cash" ? "totalExpanseCash" : "totalExpanseDigitalPayment"] -= parseFloat(amount);

    updatedTotals.totalCashWallet = updatedTotals.totalIncomeCash - updatedTotals.totalExpanseCash;
    updatedTotals.totalDigitalPaymentWallet =
      updatedTotals.totalIncomeDigitalPayment - updatedTotals.totalExpanseDigitalPayment;

    await walletDoc.set(updatedTotals);

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};
  
  

  
  