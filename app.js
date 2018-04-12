var express = require('express'); //pacote para definir rotas
var mysql = require('mysql'); //pacote para acessa BD
var session = require('express-session'); //pacote para criar SESSION
var bodyparse = require('body-parser'); //pacote para enviar e receber dados das views
var CoinMarketCap = require("node-coinmarketcap");//api para retornar cotacao atual do btc
var cron = require('node-cron'); //pacote para agendar tarefas
var md5 = require('md5'); //pacote para critografar dados

var app = express(); //"app" criado para se usar o express
var moeda;
var valor;
var data;

var sess; //variavel para criar sessao
var coinmarketcap = new CoinMarketCap(); //preparando api para uso

app.use(session({ //criacao da SESSION
    secret: 'shssssss',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

//configurações gerais para se usar body-parser e express
app.use(bodyparse.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(bodyparse.json());
app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);

//criando conexão no banco de dados
var db = mysql.createConnection({
	host : 'localhost',
	user :  'root',
	password: '',
	database: 'nodemysql', //nome do banco
	insecureAuth : true
});

//estabelecendo conexão
db.connect((err) => {
	if(err){//se ocorrer erro com conexão erro é impresso
		throw err;
	}
	console.log("mysql connect");
});

//rota para se cadastrar
app.get('/user/new', (req,res) => {
	sess=req.session;
	res.render("sign_up");
})

//post para inserir novo usuario no banco
app.post('/users', (req,res) => {
	sess=req.session;
	//md5 usado em senha para codifica-la
	let sql = "INSERT INTO users(email, senha) values ('" + req.body.email + "','" + md5(req.body.password) + "')";
	db.query(sql, (err, result) => {
		if(err) {
			throw err;
			res.render("sign_up");	
		}else{//variavel failed usada para o alert 
			res.render("login", {failed : 0});
		}
	})
})

//rota para a pagina de login
app.get("/login", function(req,res,next) {
	sess=req.session; //utilizando sessao na pagina

	if(sess.email){
		res.redirect("cotacoes");
		next();
	}else{
		res.render("login", {failed : 0});
		next();
	}
})

//rota para pagina inicial
app.get("/", function(req,res){
	sess=req.session;

	// sess.email;
	// sess.id;
	if (!sess.email) {
		res.render("welcome", {email : null});
	}else{
		res.redirect("cotacoes");
	}
})

//rota para procurar usuario ao realizar login
app.post("/login", function(req,res){
	var senha = req.body.password; //var senha = senha passada pelo form do login
	var id;
	sess=req.session;

	senha = md5(senha); //passando senha para o formato md5
	let sql = "SELECT * FROM users where email ='" + req.body.email +"' and senha ='" + senha + "'";
	db.query(sql, (err, resultSet) => {
		if(resultSet.length <= 0) {//verifica se nao foram encontrados resultados no banco
			console.log("usuario nao encontrado");
			res.render("login", {failed : 1});	
		}else{
			sess.email = req.body.email;
			id = resultSet[0].id;
			sess.id_user = id;
			// console.log(resultSet);
			// res.render("cotacoes", {cotacoes : resultSet, email : sess.email});
			res.redirect('/cotacoes');
		}
	})
})

//logout para destruir sessao
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

			let sql = "SELECT * FROM cotacoes"; //pega cotacoes adicionadas no banco pelo cron e manda para view
			db.query(sql, (err, resultSet) => {
				if(resultSet.length <= 0) {
					console.log("cotacoes nao encontradas");
					res.render("cotacoes", {email : sess.email, btc_symbol : symbol, cotacoes : null, btc_price : price, date : new Date()});	
				}else{
					console.log('cotacoes antigas encontradas');
					// console.log(typeof price);
					// console.log(typeof cotacoes[2].valor)
					res.render("cotacoes", {email : sess.email, btc_symbol : symbol, btc_price : price, date : new Date(), cotacoes : resultSet});	
				}
			})
		});


	}else{
		//se usuario tentar acessar essaa pagina sem estar logado é redirecionado para o login
		res.render("login", {failed : 0});	
	}
})

//pagina para listar as ordens do usuario
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
		res.redirect('login');//se usuario tentar acessar essaa pagina sem estar logado é redirecionado para o login
	}
})

//rota para a pagina de criação de ordem
app.get('/criar_ordem', function(req,res){
	sess=req.session;

	if(sess.email){
		res.render('criar_ordem', {email : sess.email});
	}else{
		res.redirect('login');
	}
})

//post para adicionar ordem no banco
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

app.listen('3000', () => { //abrindo a aplicação na porta 3000
	console.log("Server started");
});

//inicializacao do cron para agendar inserçao de cotacoes no banco
cron.schedule('*/1 * * * *', function(){ //roda escopo a cada 1 minuto
  console.log('running a task every minute');

	coinmarketcap.get("bitcoin", coin => {//pegando dados da cotacao atual com API
		moeda = coin.symbol;
		valor = coin.price_usd;
		data = +new Date;
	});

	if(moeda && valor){ //verifica se a API pegou os dados corretamente

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
