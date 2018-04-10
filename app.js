var express = require('express');
var mysql = require('mysql');
var session = require('express-session');
var bodyparse = require('body-parser');
var CoinMarketCap = require("node-coinmarketcap");
var cron = require('node-cron');
var md5 = require('md5');
var app = express();

var moeda;
var valor;
var data;
var exchange;


var sess;
var coinmarketcap = new CoinMarketCap();

app.use(session({
    secret: 'shssssss',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyparse.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(bodyparse.json());
app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);

+new Date


//create connection

var db = mysql.createConnection({
	host : 'localhost',
	user :  'root',
	password: '',
	database: 'nodemysql',
	insecureAuth : true
});

db.connect((err) => {
	if(err){
		throw err;
	}
	console.log("mysql connect");
});

//create db

app.get('/createdb', (req,res) => {
	sess=req.session;
	let sql = 'CREATE DATABASE nodemysql';
	db.query(sql, (err, result) => {
		if(err) throw err;
		console.log(result);
		res.send('database created ....');
	})
})

//create table

app.get('/createusertable', (req,res) => {
	// sess=req.session;
	let sql = "CREATE TABLE users(id int AUTO_INCREMENT, email varchar(50), senha VARCHAR(35), PRIMARY KEY (id))";
	db.query(sql, (err, result) => {
		if(err) throw err;
		console.log(result);
		res.send('table created ....');
	})
})

app.get('/user/new', (req,res) => {
	sess=req.session;
	res.render("sign_up");
})

app.post('/users', (req,res) => {
	sess=req.session;
	let sql = "INSERT INTO users(email, senha) values ('" + req.body.email + "','" + md5(req.body.password) + "')";
	db.query(sql, (err, result) => {
		if(err) {
			throw err;
			res.render("sign_up");	
		}else{
			res.redirect("login", {failed : 0});
		}
	})
})

app.get("/login", function(req,res,next) {
	sess=req.session;
	// res.render("login");

	if(sess.email){
		res.redirect("cotacoes");
		next();
	}else{
		res.render("login", {failed : 0});
		next();
	}
})

app.get("/", function(req,res){
	sess=req.session;

	// sess.email;
	// sess.id;

	res.render("welcome");
})

app.post("/login", function(req,res){
	var senha = req.body.password;
	var id;
	sess=req.session;

	senha = md5(senha);
	let sql = "SELECT * FROM users where email ='" + req.body.email +"' and senha ='" + senha + "'";
	db.query(sql, (err, resultSet) => {
		if(resultSet.length <= 0) {
			// throw err;
			// alert("email ou senha incorretos");
			console.log("usuario nao encontrado");
			res.render("login", {failed : 1});	
		}else{
			sess.email = req.body.email;
			id = resultSet[0].id;
			sess.id_user = id;
			// console.log(resultSet);
			res.redirect("cotacoes");
		}
	})
})


app.get('/logout',function(req,res){
	req.session.destroy(function(err) {
 		if(err) {
    		console.log(err);
  		} else {
    		res.redirect('/');
  		}
	})
})

app.get("/cotacoes", function(req,res) {
	sess=req.session;
	var btc_symbol;
	var btc_price;
	
	if (sess.email) {
		
		coinmarketcap.get("bitcoin", coin => {
		    // res.render("cotacoes", {email : sess.email, btc_symbol : coin.symbol, btc_price : coin.price_usd, date : +new Date});
		    price = coin.price_usd;
		    symbol = coin.symbol;

			let sql = "SELECT * FROM cotacoes";
			db.query(sql, (err, resultSet) => {
				if(resultSet.length <= 0) {
					console.log("cotacoes nao encontradas");
					res.render("cotacoes", {email : sess.email, btc_symbol : btc_symbol, btc_price : btc_price, date : new Date()});	
				}else{
					console.log('cotacoes antigas encontradas');
					res.render("cotacoes", {email : sess.email, btc_symbol : symbol, btc_price : price, date : new Date(), cotacoes : resultSet});	

				}
			})
		});


	}else{
		res.render("login", {failed : 0});	
	}
})

app.get('/ordens', function(req, res){
	sess=req.session;

	if (sess.email) {

		let sql = "SELECT * FROM ordens where usuarioid = "+sess.id_user;
		db.query(sql, (err, ordens) => {
			if(err) {
				throw err;
			}else{
				res.render('ordens', {ordens : ordens, email : sess.email});
			}
		})
	}
	else{
		res.redirect('login');
	}
})

app.get('/criar_ordem', function(req,res){
	sess=req.session;

	if(sess.email){
		res.render('criar_ordem', {email : sess.email});
	}else{
		res.redirect('login');
	}
})

app.post('/ordem/new', function(req,res){
	sess = req.session;

	coinmarketcap.get("bitcoin", coin => {
		valor = coin.price_usd;
		data = +new Date;

		let sql = "INSERT INTO ordens(usuarioid,qtdbtc, valorporbtc, tipo) values ('"+sess.id_user+"','"+req.body.qtdbtc+"','"+valor+"', '"+req.body.tipo+"');";
		db.query(sql, (err, result) => {
			if(err) {
				console.log("ordem nao adicionada:" + err);
			}else{
				console.log("Ordem adicionada com sucesso");
				res.redirect('../ordens');
			}
		})
	});
})

app.listen('3000', () => {
	console.log("Server started");
});

cron.schedule('*/1 * * * *', function(){
  console.log('running a task every minute');

	coinmarketcap.get("bitcoin", coin => {
		moeda = coin.symbol;
		valor = coin.price_usd;
		data = +new Date;
	});

	if(moeda && valor){

	  let sql = "INSERT INTO cotacoes(moeda, valor) values ('"+moeda+"','"+valor+"');";
		db.query(sql, (err, result) => {
			if(err) {
				console.log("cotacao nao adicionada no banco:" + err);
			}else{
				console.log("Cotacao adicionada com sucesso");
			}
		})
	}
});
