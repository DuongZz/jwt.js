const User = require('../models/User');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    deleteUsers: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            res.status(200).json("Delete Successfully")
        } catch (err) {
            res.status(500).json(err)
        }
    },
    updateUsers: async (req, res) => {
        try{
        const user = await User.findById(req.params.id);
        const result = await User.updateOne({_id:req.params.id },{$set : req.body});
        res.status(200).json(result);
        }catch(err){
            res.status(500).json(err);
        }
    },
}

module.exports = userController;