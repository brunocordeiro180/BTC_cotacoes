# BTC_cotacoes

API para retornar Cotação Atual do BitCoin e simular criação de ordens.

## Getting Started

Para rodar a aplicação siga as instruções

### Prerequisites

-Nodejs
-Mysql 

### Installing

**Primeiramente abra seu banco de dados e execute o código sql encontrado em "db.sql"**
O arquivo "db.sql" ja cria o banco para você então não se preocupe com isso.
Nome do banco: "nodemysql"
Nome do usuário: "root"
Senha do usuário do banco: ""
Configuração do banco se encontra no começo do arquivo "app.js"

Dentro da pasta BTC_cotacoes no terminal execute o arquivo app.js

```
node app.js
```

Acesse o localhost:3000

* [Página inicial](http://localhost:3000/) 

End with an example of getting some data out of the system or using it for a little demo

## Built With

* [Nodejs](https://nodejs.org/) - Javascript

-Pacotes usados

* [express](https://maven.apache.org/) 
* [body-parser](https://www.npmjs.com/package/body-parser) 
* [mysql](https://www.npmjs.com/package/mysql)
* [cron](https://www.npmjs.com/package/cron)
* [coinmarketcap](https://www.npmjs.com/package/coinmarketcap)
* [md5](https://www.npmjs.com/package/md5)

## Authors

* **Bruno Cordeiro Mendes** - *Initial work* - [brunocordeiro180](https://github.com/brunocordeiro180)
