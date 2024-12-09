import { db } from '../db/firebase.js';
  
export const getAllIncomes = async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userIncomeCollection = db.collection("users").doc(uid).collection("income");
    const snapshot = await userIncomeCollection.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No incomes found" });
    }

    const incomes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching all incomes:", error);
    res.status(500).json({ message: "Error fetching incomes", error: error.message });
  }
};

export const getIncomeById = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    if (!uid || !id) {
      return res.status(400).json({ message: "User ID and income ID are required" });
    }

    const userIncomeCollection = db.collection("users").doc(uid).collection("income");
    const doc = await userIncomeCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching income:", error);
    res.status(500).json({ message: "Error fetching income", error: error.message });
  }
};

export const createIncome = async (req, res) => {
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

    const incomeCollection = db.collection("users").doc(uid).collection("income");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const newIncome = { date, amount: parseFloat(amount), description, category, wallet };
    const docRef = await incomeCollection.add(newIncome);
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
      totalIncomeCash: wallet === "cash" ? totalIncomeCash + parseFloat(amount) : totalIncomeCash,
      totalIncomeDigitalPayment: wallet === "digital payment" ? totalIncomeDigitalPayment + parseFloat(amount) : totalIncomeDigitalPayment,
      totalExpanseCash,
      totalExpanseDigitalPayment,
      totalCashWallet: (wallet === "cash" ? totalIncomeCash + parseFloat(amount) : totalIncomeCash) - totalExpanseCash,
      totalDigitalPaymentWallet: (wallet === "digital payment" ? totalIncomeDigitalPayment + parseFloat(amount) : totalIncomeDigitalPayment) - totalExpanseDigitalPayment,
    };

    await walletDoc.set(updatedTotals);

    res.status(201).json({ message: "Income created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating income:", error);
    res.status(500).json({ message: "Error creating income", error: error.message });
  }
};

export const updateIncome = async (req, res) => {
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

    const incomeCollection = db.collection("users").doc(uid).collection("income");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const incomeDoc = await incomeCollection.doc(id).get();

    if (!incomeDoc.exists) {
      return res.status(404).json({ message: "Income not found" });
    }

    const previousAmount = parseFloat(incomeDoc.data().amount);
    const previousWallet = incomeDoc.data().wallet;

    await incomeCollection.doc(id).set(
      { id, date, amount: parseFloat(amount), description, category, wallet },
      { merge: true }
    );

    const walletSnapshot = await walletDoc.get();
    const existingWallet = walletSnapshot.exists
      ? walletSnapshot.data()
      : { totalIncomeCash: 0, totalIncomeDigitalPayment: 0, totalExpanseCash: 0, totalExpanseDigitalPayment: 0 };

    const updatedTotals = { ...existingWallet };

    updatedTotals[previousWallet === "cash" ? "totalIncomeCash" : "totalIncomeDigitalPayment"] -= previousAmount;

    updatedTotals[wallet === "cash" ? "totalIncomeCash" : "totalIncomeDigitalPayment"] += parseFloat(amount);

    updatedTotals.totalCashWallet = updatedTotals.totalIncomeCash - updatedTotals.totalExpanseCash;
    updatedTotals.totalDigitalPaymentWallet =
      updatedTotals.totalIncomeDigitalPayment - updatedTotals.totalExpanseDigitalPayment;

    await walletDoc.set(updatedTotals);

    res.status(200).json({ message: "Income updated successfully" });
  } catch (error) {
    console.error("Error updating income:", error);
    res.status(500).json({ message: "Error updating income", error: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const incomeCollection = db.collection("users").doc(uid).collection("income");
    const walletDoc = db.collection("users").doc(uid).collection("wallet").doc("totals");

    const incomeDoc = await incomeCollection.doc(id).get();

    if (!incomeDoc.exists) {
      return res.status(404).json({ message: "Income not found" });
    }

    const { amount, wallet } = incomeDoc.data();

    await incomeCollection.doc(id).delete();

    const walletSnapshot = await walletDoc.get();
    const existingWallet = walletSnapshot.exists
      ? walletSnapshot.data()
      : { totalIncomeCash: 0, totalIncomeDigitalPayment: 0, totalExpanseCash: 0, totalExpanseDigitalPayment: 0 };

    const updatedTotals = { ...existingWallet };

    updatedTotals[wallet === "cash" ? "totalIncomeCash" : "totalIncomeDigitalPayment"] -= parseFloat(amount);

    updatedTotals.totalCashWallet = updatedTotals.totalIncomeCash - updatedTotals.totalExpanseCash;
    updatedTotals.totalDigitalPaymentWallet =
      updatedTotals.totalIncomeDigitalPayment - updatedTotals.totalExpanseDigitalPayment;

    await walletDoc.set(updatedTotals);

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Error deleting income", error: error.message });
  }
};

  
