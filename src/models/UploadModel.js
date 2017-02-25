var mongoose = require('mongoose'), Schema = mongoose.Schema;

var uploadModel = new Schema({
	identificador: {type:String},
	nomeOriginal :{type: String},

	linkArquivoOriginal:{type: String},
	linkArquivoGrande:{type: String},
	linkArquivoPequeno:{type: String},
	linkArquivoThumb:{type: String},

	destaque :{type: Boolean},
	dataCriacao:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Upload', uploadModel);