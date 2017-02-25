
var moment = require('moment');
var fs = require('fs');
var Upload = require('s3-uploader');



// Tutorial : https://www.npmjs.com/package/s3-uploader

var clientS3 = new Upload('virtz-bucket', {
  aws: {
    path: 'images/',
    //region: 'US West 2',
    acl: 'public-read',
    accessKeyId : 'AKIAIQHKHWTQ5UBYZWEA',
    secretAccessKey: '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'
  },
 
  cleanup: {
    versions: true,
    original: true
  },
 
  original: {
    awsImageAcl: 'public-read'
  },
 
  versions: [{
    maxHeight: 1040,
    maxWidth: 1040,
    format: 'jpg',
    suffix: '-large',
    quality: 80,
    awsImageExpires: 31536000,
    awsImageMaxAge: 31536000
  }
  //,{
  //  maxWidth: 780,
  //  aspect: '3:2!h',
  //  suffix: '-medium'
  //}
  ,{
    maxWidth: 320,
    aspect: '16:9!h',
    suffix: '-small'
  }
  ,{
    maxHeight: 100,
    aspect: '1:1',
    format: 'png',
    suffix: '-thumb1'
  }
  //,{
  //  maxHeight: 250,
  //  maxWidth: 250,
  //  aspect: '1:1',
  //  suffix: '-thumb2'
  //}
  ]
});


var callbackUpload = function(filename, req, res){
			
			// isso é para prevenir erro de upload de arquivos com espaços. Então eu altero o nome e renomeio o arquivo.
			var filenameNew = filename.replace(' ', '_');
			if(filename.indexOf(" ") > 0){
        		var filenameNew = filename.replace(' ', '_');
        		fs.rename('./uploads/' + filename, './uploads/' + filenameNew, function (err) {
				  if (err) throw err;
				  	console.log(filename+' renomeado para '+filenameNew);
				});
        	}

        	console.log('Nome do upload: '+ filenameNew);

			clientS3.upload('./uploads/'+filenameNew, {}, function(err, versions, meta) {
		 	 	if (err) { throw err; }
		 
		 		// apos o upload pro s3 salva no banco
		 		var upload = new uploadModel(req.body);

				upload.nomeOriginal = filenameNew;
				upload.dataCriacao = moment().second(0).millisecond(0).format();
				
				var cont = 0;
				var prefixoSite = 'https://virtz-bucket.s3.amazonaws.com/';
			  	versions.forEach(function(image) {
			  		console.log(image);

			  		if(cont == 0){
			  			upload.linkArquivoGrande = prefixoSite + image.key;
			  		} else if(cont == 1){
			  			upload.linkArquivoPequeno = prefixoSite + image.key;
			  		} else if(cont == 2){
			  			upload.linkArquivoThumb = prefixoSite + image.key;
			  		} else if(cont == 3){
			  			upload.linkArquivoOriginal = prefixoSite + image.key;
			  		}	

			  		cont++;
			    	//console.log(image.width, image.height, image.url);

			    	// 1024 760 https://my-bucket.s3.amazonaws.com/path/110ec58a-a0f2-4ac4-8393-c866d813b8d1.jpg 
			  	});

			  	console.log('montou o objeto normal agora vai devolver');
			  	console.log(upload);

			  	upload.save();
				res.status(201);
				res.send(upload);	

			  	//res.redirect('back');
			});
            

		};


var uploadController = function(uploadModel){

	var salvarNovo = function(req, res){
		console.log(' ::: Salvar Novo Arquivo');
		var erroValidacao = false;

		// valida se o cara enviou um identificador para a imagem
		var identificador = '';
		if(req.query.identificador){
			identificador = req.query.identificador;
		} else {
			res.status(400).send("É obrigatório um identificador para a imagem. Deve ser passado como parametro: ?identificador=XXXXX");
			erroValidacao = true;
		}

		// recupera se a imagem é destaque. Default is false;
		var destaque = false;
		
		if(req.query.destaque){
			destaque = req.query.destaque;	
		} 	
		
		if(!erroValidacao){
			var fstream;
		    req.pipe(req.busboy);
		    req.busboy.on('file', function (fieldname, file, filename) {
		        console.log("Uploading: " + filename); 
		        fstream = fs.createWriteStream('./uploads/' + filename);
		        file.pipe(fstream);
		        fstream.on('close', function () {
		        	callbackUpload(filename, req, res);
		        });
		    });	
		}
	
	};



	var remover = function(req, res){
		console.log(' ::: Remover Arquivo');
		req.upload.remove(function(err){
			if(err){
				res.status(500).send(err);
			} else {
				res.status(204).send('upload removido.');
			}
		});
	
	};


	var listar = function(req, res){
		console.log(' ::: Listar Arquivos');
		var query = {};
		if(req.query){
			query = req.query;
		} 

		if(!req.query || !!req.query.identificador) {
			res.status(500).send("É obrigatório filtrar por identificador. Ou seja, tem que mandar quem está atrelado a imagem.");
		}

		uploadModel.find(query, function(err, uploads){
			if(err){
				res.status(500).send(err);
			} else {
				var returnuploads = [];
				uploads.forEach(function(element, index, array){
					var uploadObj = element.toJSON();
					returnuploads.push(uploadObj);
				});

				res.json(returnuploads);
			}
		});
	};

	return {
		listar 		: listar,
		remover 	: remover,
		salvarNovo 	: salvarNovo
	};

};

module.exports = uploadController;