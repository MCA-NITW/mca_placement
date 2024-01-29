const User = require('../models/User');
const logger = require('../utils/logger');
const validateUser = require('../utils/validateUser');
const { isValidObjectId } = require('mongoose');

// View all users
exports.viewAllUsers = async (req, res) => {
	try {
		const users = await User.find({});
		if (!users) {
			return res.status(404).json({ message: 'No users found' });
		}
		logger.info(`All users Viewed`);
		users.forEach((user) => {
			user.password = null;
		});
		res.status(200).json({ users });
	} catch (error) {
		logger.error(error);
		res.status(500).json({ error });
	}
};

// View a single user by ID
exports.viewSingleUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		logger.info(`User Viewed: ${user.name}`);
		user.password = null;
		res.status(200).json({ user });
	} catch (error) {
		logger.error(error);
		res.status(500).json({ error });
	}
};

// Update a User
exports.updateUser = async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		const validationError = validateUser(req.body);
		if (validationError.length > 0) return res.status(400).json({ errors: validationError });

		const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		logger.info(`User updated: ${updatedUser.name}`);
		res.status(200).json(updatedUser);
	} catch (error) {
		logger.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Update Verification Status of a User
exports.verify = async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}
		if (req.body.isVerified !== true && req.body.isVerified !== false) {
			return res.status(400).json({ message: 'Invalid verification status' });
		}
		if (req.params.id === req.user.id) {
			return res.status(400).json({ message: 'You cannot verify your own account' });
		}

		const updatedUser = await User.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true });
		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		logger.info(`User verified: ${updatedUser.name}`);
		res.status(200).json({ message: `Verification status of ${updatedUser.name} updated Successfully` });
	} catch (error) {
		logger.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Update Role of a User
exports.updateRole = async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}
		console.log(req.body.role);
		if (req.body.role !== 'admin' && req.body.role !== 'student' && req.body.role !== 'placementCoordinator') {
			return res.status(400).json({ message: 'Invalid role' });
		}
		if (req.params.id === req.user.id) {
			return res.status(400).json({ message: 'You cannot change your own role' });
		}
		const updatedUser = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		logger.info(`User role updated: ${updatedUser.name}`);
		res.status(200).json({ message: `Role of ${updatedUser.name} updated Successfully` });
	} catch (error) {
		logger.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Delete a User
exports.deleteUser = async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}
		if (req.params.id === req.user.id) {
			return res.status(400).json({ message: 'You cannot delete your own account' });
		}
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found' });
		}
		logger.info(`User deleted: ${deletedUser.name}`);
		res.status(200).json({ message: `Student ${deletedUser.name} deleted Successfully` });
	} catch (error) {
		logger.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
