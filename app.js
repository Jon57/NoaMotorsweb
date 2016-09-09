var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var method_override = require("method-override");
var multer = require('multer');
var cloudinary = require("cloudinary");
var uploader = multer({dest: "./uploads"});
var app_password = "12345678";
var Schema = mongoose.Schema;

cloudinary.config({
	cloud_name: "dx28rjqva",
	api_key: "298684625261878",
	api_secret: "MpyV68XX4lRloRAVEZ_81x1Ejho"
});

var app = express();

mongoose.connect("mongodb://localhost/Primera_pagina");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-method-override')('_method'));
app.use(method_override("_method"));
app.use(multer({dest: "./uploads"}).single('image_avatar'));

//Definir el schema de nuestros productos
var productSchemaJSON = {
	title:String,
	description:String,
	imageUrl: String,
	pricing: Number
};

var productSchema = new Schema(productSchemaJSON);

productSchema.virtual("image.url").get(function(){
	if(this.imageUrl === "" || this.imageUrl === "data.png"){
		return "default.jpg";
	}

	return this.imageUrl;
});

var Product = mongoose.model("Product", productSchema);

app.set("view engine","jade");

app.use(express.static("public"));

app.get("/",function(solicitud,respuesta){
	respuesta.render("index");
});

app.get("/productos",function(solicitud,respuesta){
	Product.find(function(error,documento){
		if(error){ console.log(error); }
		respuesta.render("productos/index",{ products: documento })
	});
});

app.get("/Contacto",function(solicitud,respuesta){
	Product.find(function(error,documento){
		if(error){ console.log(error); }
		respuesta.render("Contacto/index",{ products: documento })
	});
});

//Actualizar Producto
app.put("/productos/:id",function(solicitud,respuesta){
	if(solicitud.body.password == app_password){
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			pricing: solicitud.body.pricing
		};	

		if(solicitud.file){
			cloudinary.uploader.upload(solicitud.file.path, 
				function(result) {
					data.imageUrl = result.url;
					
					Product.update({"_id": solicitud.params.id},data,function(product){
						respuesta.redirect("/productos");
					});
				}
			);			
		}else{
			Product.update({"_id": solicitud.params.id},data,function(product){
				respuesta.redirect("/productos");
			});
		}
		


		}else{
		respuesta.redirect("/");
	}
});

app.get("/productos/edit/:id",function(solicitud,respuesta){
	var id_producto = solicitud.params.id;
	//console.log(id_producto);
	Product.findOne({"_id": id_producto},function(error,producto){
		console.log(producto);
		respuesta.render("productos/edit",{ product: producto });
	});

});

app.post("/admin",function(solicitud,respuesta){
	if(solicitud.body.password == app_password){
		Product.find(function(error,documento){
			if(error){ console.log(error); }
			respuesta.render("admin/index",{ products: documento })
		});
	}else{
		respuesta.redirect("/");
	}
});

app.get("/admin",function(solicitud,respuesta){
	respuesta.render("admin/form");
});
var middleware_upload = uploader.single('image_avatar');

app.post("/productos",function(solicitud,respuesta){
	if(solicitud.body.password == app_password){
		var data = {
			title: solicitud.body.title,
			description: solicitud.body.description,
			pricing: solicitud.body.pricing
		}
//Para poder agregar productos sin imagen
		var product = new Product(data);

		if(solicitud.files){
			cloudinary.uploader.upload(solicitud.file.path, 
				function(result) {
					product.imageUrl = result.url;
					
					product.save(function(err){
						console.log(product);
						respuesta.redirect("/productos");
					});
				}
			);
		}else{
			product.save(function(err){
				console.log(product);
				respuesta.redirect("/productos");
			});
		}

		
	}else{
		respuesta.render("productos/new");
	}

	
});

app.get("/productos/new",function(solicitud,respuesta){
	respuesta.render("productos/new");
});

app.get("/productos/delete/:id",function(solicitud,respuesta){
	var id = solicitud.params.id;

	Product.findOne({"_id": id },function(err,producto){
		respuesta.render("productos/delete",{ producto: producto });
	});

});



app.delete("/productos/:id",function(solicitud,respuesta){
	var id = solicitud.params.id;
	if(solicitud.body.password == app_password){
		Product.remove({"_id": id },function(err){
			if(err){ console.log(err); }
			respuesta.redirect("/productos");
		});
	}else{
		respuesta.redirect("/productos");
	}
});

app.get("Contacto",function(solicitud,respuesta){
	respuesta.render("/Contacto");
});




app.listen(8080);