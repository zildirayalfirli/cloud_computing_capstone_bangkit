import { db } from '../db/firebase.js';

// Create a new income record
export const createIncome = async (req, res) => {
    try {
      const { date, amount, description, category, wallet } = req.body;
      const { uid } = req.user;
  
      if (!date || !amount || !description || !category || !wallet) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const userIncomeCollection = db.collection("users").doc(uid).collection("income");
  
      const newIncome = { date, amount, description, category, wallet };
      const docRef = await userIncomeCollection.add(newIncome);
  
      await docRef.update({ id: docRef.id });
  
      res.status(201).json({ message: "Income created successfully", id: docRef.id });
    } catch (error) {
      console.error("Error creating income:", error);
      res.status(500).json({ message: "Error creating income", error: error.message });
    }
  };
  
// Fetch all income records for the logged-in user
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

// Fetch a specific income record by ID for the logged-in user
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

// Update an income record by ID for the logged-in user
export const updateIncome = async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { date, amount, description, category, wallet } = req.body;
  
      if (!uid || !id) {
        return res.status(400).json({ message: "User ID and income ID are required" });
      }
  
      if (!date || !amount || !description || !category || !wallet) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const userIncomeCollection = db.collection("users").doc(uid).collection("income");
      const incomeDoc = await userIncomeCollection.doc(id).get();
  
      if (!incomeDoc.exists) {
        return res.status(404).json({ message: "Income record not found" });
      }
  
      await userIncomeCollection.doc(id).set(
        { id, date, amount, description, category, wallet },
        { merge: true }
      );
  
      res.status(200).json({ message: "Income updated successfully" });
    } catch (error) {
      console.error("Error updating income:", error);
      res.status(500).json({ message: "Error updating income", error: error.message });
    }
  };
  

// Delete an income record by ID for the logged-in user
export const deleteIncome = async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.params;
  
      if (!uid || !id) {
        return res.status(400).json({ message: "User ID and income ID are required" });
      }
  
      const userIncomeCollection = db.collection("users").doc(uid).collection("income");
      await userIncomeCollection.doc(id).delete();
  
      res.status(200).json({ message: "Income deleted successfully" });
    } catch (error) {
      console.error("Error deleting income:", error);
      res.status(500).json({ message: "Error deleting income", error: error.message });
    }
  };
  
