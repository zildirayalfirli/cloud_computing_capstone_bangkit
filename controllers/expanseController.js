const admin = require("firebase-admin");
const multer = require("multer");
const storageService = require("../services/storageService");

if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "bucket-takasimura1",
  });
}

const db = admin.firestore();

const upload = multer({
  storage: multer.memoryStorage(),
});

exports.uploadMiddleware = upload.single("buktiPengeluaran");

// Create
exports.createPengeluaran = async (req, res) => {
  const { deskripsi, jumlah, tanggal } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Bukti pengeluaran diperlukan." });
  }

  try {
    // Upload file ke Google Cloud Storage
    const imageUrl = await storageService.uploadImage(req.file);

    // Simpan data pengeluaran ke Firestore
    const pengeluaranData = { deskripsi, jumlah, tanggal, buktiUrl: imageUrl };
    const docRef = await db.collection("pengeluaran").add(pengeluaranData);

    res.status(201).json({
      message: "Pengeluaran berhasil dibuat",
      pengeluaran: { id: docRef.id, ...pengeluaranData },
    });
  } catch (error) {
    res.status(500).json({ message: "Error saat membuat pengeluaran", error: error.message });
  }
};

// Get
exports.getPengeluaran = async (req, res) => {
  try {
    const snapshot = await db.collection("pengeluaran").get();
    const pengeluaran = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(pengeluaran);
  } catch (error) {
    res.status(500).json({ message: "Error saat mengambil data", error: error.message });
  }
};

// Get (id)
exports.getPengeluaranById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection("pengeluaran").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Pengeluaran tidak ditemukan." });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error saat mengambil pengeluaran", error: error.message });
  }
};

// Update
exports.updatePengeluaran = async (req, res) => {
  const { id } = req.params;
  const { deskripsi, jumlah, tanggal } = req.body;

  try {
    const pengeluaranRef = db.collection("pengeluaran").doc(id);
    const pengeluaran = await pengeluaranRef.get();

    if (!pengeluaran.exists) {
      return res.status(404).json({ message: "Pengeluaran tidak ditemukan." });
    }

    const updatedData = { deskripsi, jumlah, tanggal };
    await pengeluaranRef.update(updatedData);

    res.status(200).json({ message: "Pengeluaran berhasil diperbarui.", pengeluaran: updatedData });
  } catch (error) {
    res.status(500).json({ message: "Error saat memperbarui data", error: error.message });
  }
};

// Delete
exports.deletePengeluaran = async (req, res) => {
  const { id } = req.params;

  try {
    const pengeluaranRef = db.collection("pengeluaran").doc(id);
    const pengeluaran = await pengeluaranRef.get();

    if (!pengeluaran.exists) {
      return res.status(404).json({ message: "Pengeluaran tidak ditemukan." });
    }

    await pengeluaranRef.delete();

    res.status(200).json({ message: "Pengeluaran berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Error saat menghapus data", error: error.message });
  }
};