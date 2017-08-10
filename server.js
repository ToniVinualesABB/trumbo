var express = require('express');
var app = express();
server=require('http').createServer(app);
io=require('socket.io').listen(server);
nicknames=[];
//inicializar index.html
app.use(express.static(__dirname + '/www'));
//socket.io
io.sockets.on('connection',function(socket){
//CHAT
	socket.on('new user',function(data,callback){
		if (nicknames.indexOf(data)!=-1){
			callback(false);
		}else{
			callback(true);
			socket.nickname=data;
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	console.log('userconnected:'+nicknames);
	});
	function updateNicknames(){
		io.sockets.emit('usernames',nicknames);
	}
	socket.on('send message',function(data){
		var msg=data.trim();
		var newMsg=new Chat({msg:msg,nick:socket.nickname});
		newMsg.save(function(err){
			if (err) throw err;
			io.sockets.emit('new message',{msg:data,nick:socket.nickname});
		});
	});
	socket.on('disconnect',function(data){
	 if(!socket.nickname) return;
	 nicknames.splice(nicknames.indexOf(socket.nickname),1);
	 updateNicknames();
	 console.log('userconnected:'+nicknames);
	});
//MODAL
    socket.on('reqloaddatabase',function(data){ 
	    console.log("CORERECTO");
    var selectbusiness=data.name;
    console.log("YEAHHHHH"+selectbusiness);
    NewLayout.find({projectUnit:selectbusiness},function(err,docs){
	var docsmap=[];
	if(err) throw err;
		// handle the error safely
		if(!docs){
		console.log("NOT PROJECTS TO LOAD FROM DATABASE");
        return false; 					
        }else {
			docs.forEach(function(doc){
						console.log(doc._id);
			var reducestring=doc._id.substring(selectbusiness.length); 
			docsmap.push(reducestring);			
			});
			var jsontoclient=JSON.stringify(docsmap);
			console.log(jsontoclient);	
		    socket.emit('ansloaddatabase',jsontoclient);
		}	
});	
});	
    socket.on('Createproject',function(data) {
       var projectsavename =data.businessunit+data.name;
       var businesssaveunitname = data.businessunit;
	   var scenesavedb=data.scenebabylon;  
       NewLayout.count({_id: projectsavename}, function (err, count){ 
              if(count>0){
                //message: NOT POSSIBLE.PROJECT ALREADY CREATED!
              }else{	
	    NewLayout.findById("FLEXSPOTBLANKLAYOUT125", function(err,docs){
        if(err) throw err;
		// handle the error safely
		if(!docs){
		console.log("PROJECT NOT FOUND ON DATA BASE");
        return false; 					
        }else {
		var dbLayout=docs.projectScene;
		var newProject=new NewLayout({_id:projectsavename ,projectUnit:businesssaveunitname,projectScene:dbLayout});
		              newProject.save(function(err){
			            if (err) throw err;
				       });
        socket.emit('loadscene',{namescene:projectsavename,nameunit:businesssaveunitname,namelayout:dbLayout});
        }
     });
			  }
	 		});
			});
	socket.on('Loadproject',function(data) {
        var projectloadname=data.name;
		console.log(projectloadname);
		NewLayout.findById(projectloadname, function(err,docs){
        if(err) throw err;
		// handle the error safely
		if(!docs){
		console.log("PROJECT NOT FOUND ON DATA BASE");
        return false; 					
        }
        else {
		var dbname=docs._id;
		var dbunit=docs.projectUnit;
		var dbLayout=docs.projectScene;
        socket.emit('loadscene',{namescene:dbname,nameunit:dbunit,namelayout:dbLayout});
        }
		});
 });
	socket.on('Saveproject',function(data) {
    // do something with data
       var projectsavename =data.businessunit+data.name;
       var businesssaveunitname = data.businessunit;
	   var scenesavedb=data.scenebabylon;
	   		NewLayout.findById(projectsavename, function(err,docs){
        if(err) throw err;
		// handle the error safely
		if(!docs){
			console.log("SAVING NEW PROJECT");
			var newProject=new NewLayout({_id:projectsavename ,projectUnit:businesssaveunitname,projectScene:scenesavedb});
		    newProject.save(function(err){
					if (err) { console.log("PROJECT TOO BIG"); return;
					}
					});				
        }
        else {
				console.log("SAVING EXISITNG PROJECT");
				docs._id=projectsavename;
				docs.projectUnit=businesssaveunitname;
				docs.projectScene=scenesavedb;
				docs.save(function(err){
                 if (err) { console.log("PROJECT TOO BIG"); return;
					}
					});
        }
		});
			socket.emit('savescene',{namescene:projectsavename,nameunit:businesssaveunitname,namelayout:scenesavedb});
});
//SCENE BABYLON
socket.on('updatepriceandcycletime',function(data){	
NewItem.findById(data, function(err,docs){
			if(err) throw err;
			if(!docs){
		      console.log("GEOMETRY NOT FOUND ON DATA BASE");
              return false; 					
            }
            else {
			var name=docs._id;
			var price=docs.price;
			var cycletime=docs.cycletime;
			socket.emit('geometryupdate',{nameitem:name,priceitem:price,ctitem:cycletime});
			}
		    });
			});
socket.on('addgeometrytoscene', function(data){	
		 NewItem.findById(data, function(err,docs){
			if(err) throw err;
			if(!docs){
		      console.log("GEOMETRY NOT FOUND ON DATA BASE");
              return false; 					
            }
            else {
			var name=docs._id;
			var price=docs.price;
			var cycletime=docs.cycletime;
			socket.emit('geometryOnscene',{nameitem:name,priceitem:price,ctitem:cycletime});
			}
		    });
	});
socket.on('paschangecards', function(data){
		NewItem.findById(data, function(err,docs){
			if(err) throw err;
			if(!docs){
		    console.log("GEOMETRY NOT FOUND ON DATA BASE");
            return false; 					
            }
			 else {
				var name=docs._id;
				var price=docs.price;
				var cycletime=docs.cycletime;
				socket.emit('geometryChangecardsofscene',{nameitem:name,priceitem:price,ctitem:cycletime});
			}
		    });
});	
socket.on('removegeometryfromscene', function(data){
		NewItem.findById(data, function(err,docs){
			if(err) throw err;
			if(!docs){
		    console.log("GEOMETRY NOT FOUND ON DATA BASE");
            return false; 					
            }
			 else {
				var name=docs._id;
				var price=docs.price;
				var cycletime=docs.cycletime;
				socket.emit('geometryOutofscene',{nameitem:name,priceitem:price,ctitem:cycletime});
			}
		    });
	});
});
//inicializar server
//var server = server.listen(8082,'10.34.29.179', function () {
//	var server = server.listen(3000,'127.0.0.1', function () {
//	var port = server.address().port;
//	console.log('Server running at port %s', port);
//});
// finally, let's start our server...
var server = server.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
//base de datos
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/testeotoni');
mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log('Connected to mongodb');
});
//ESTRUCTURA DE DATOS
//chat
var chatSchema=mongoose.Schema({
	nick:String,
	msg:String,
	created:{type: Date,default:Date.now}
});
//escena
var LayoutSchema=mongoose.Schema({
	_id:String,
	projectUnit:String,
	projectScene:String,
	created:{type: Date,default:Date.now}
});
//items
var ItemsSchema=mongoose.Schema({
	_id:String,
	price:Number,
	cycletime:Number,
	created:{type: Date,default:Date.now}
});
//MODELO
//chat
var Chat=mongoose.model('Message',chatSchema);
//escena
var NewLayout=mongoose.model('Layout',LayoutSchema);
//items
var NewItem=mongoose.model('Item',ItemsSchema);








