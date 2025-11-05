// controllers/businessController.js
import Business from "../models/businessModel.js";

// Create new business
export const createBusiness = async (req, res) => {
  try {
    const { user_id, name, description, address } = req.body;

    const business = await Business.create({
      user_id,
      name,
      description,
      address,
    });

    res.status(201).json({
      message: "Business created successfully",
      data: business,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all businesses
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll();
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single business by ID
export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findByPk(id);

    if (!business) return res.status(404).json({ message: "Business not found" });

    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a business
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, status } = req.body;

    const business = await Business.findByPk(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    await business.update({ name, description, address, status });

    res.status(200).json({
      message: "Business updated successfully",
      data: business,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a business
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    await business.destroy();

    res.status(200).json({ message: "Business deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
