var express = require('express');

var uploadModel = require('../models/UploadModel');

var uploadRouter = express.Router();

var uploadController = require('../controller/UploadController')(uploadModel);


uploadRouter.route('/')
		.post(function(req, res){
			uploadController.salvarNovo(req, res);
		})
		.get(function(req, res){
			uploadController.listar(req, res);
		});


uploadRouter.use('/:uploadId', function(req, res, next){
	// esse é nosso middleware
	uploadModel.findById(req.params.uploadId, function(err, upload){
		if(err){
			res.status(500).send(err);
		} else if(upload) {
			req.upload = upload;
			next();
		} else {
			res.status(404).send('upload não encontrado');
		}
	});
});


uploadRouter.route('/:uploadId')
		.get(function(req, res){
			res.json(req.upload);
		})
		.delete(function(req, res){
			uploadController.remover(req, res);
		});
		

module.exports = uploadRouter;
