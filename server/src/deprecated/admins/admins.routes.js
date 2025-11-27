const express = require("express");
const router = express.Router();
const adminsController = require("./admins.controller");
const adminsAuthController = require("./admins.auth.controller");

const handleImageUpload = require("../middleware/handleImageUpload");
const { hasToken } = require("../middleware/hasToken");
const isAdmin = require("../middleware/isAdmin");
const isSuperuser = require("../middleware/isSuperuser");

// Superusers
router.get("/", [hasToken, isSuperuser], adminsController.readAdminsBySuperuser);

// Admins
router.get("/profile", [hasToken, isAdmin], adminsController.readProfile);

router.get("/logo", [hasToken, isAdmin], adminsController.readLogo);

router.post("/termsAndConditions", [hasToken, isAdmin], adminsController.acceptTermsAndConditions);

router.put("/logo", [hasToken, isAdmin, handleImageUpload], adminsController.updateLogo);

router.put("/changePassword", [hasToken, isAdmin], adminsController.changePassword);

router.put("/changeUserPassword", [hasToken, isAdmin], adminsController.changeUserPassword);

router.get("/logoBySubdomain", adminsController.readLogoBySubdomain);

// Auth
router.post("/signIn", adminsAuthController.signIn);
router.post("/signOut", [hasToken, isAdmin], adminsAuthController.signOut);
router.get("/timeAvailable", hasToken, adminsAuthController.timeAvailableInSession);

router.get("/secret", [hasToken, isAdmin], (req, res) => res.send(`SUCCESS: Admin private route (id: ${req.userId})`));

module.exports = router;
