const middlewareController = require('../controllers/middlewareController');
const userController = require('../controllers/userController');
const router = require('express').Router();

router.get("/", middlewareController.verifyToken, userController.getAllUsers);
router.delete("/:id", middlewareController.verifyTokenAndAdminAuth, userController.deleteUsers);
router.patch('/:id', userController.updateUsers)
module.exports = router;
