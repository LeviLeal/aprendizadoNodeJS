// Carregando modulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const { error } = require("console")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")


// # CONFIGURACOES #
// SESSAO
//  ;express-session
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

// ;flash
app.use(flash())

// ;mensagem do flash
/* O flash é útil para retornar mensagens após requisições. 
    As mensagens são temporárias, então ao recarregar a página, elas somem*/
    
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

// BODYPARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// HANDLEBARS
//  ;seta o handlebars como view engine do express
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

// MONGOOSE
mongoose.Promise = global.Promise
mongoose
    .connect("mongodb://localhost/BlogApp")
    .then(() => {
        console.log("conectado ao mongo")
    })
    .catch((error) => {
        console.log("erro ao se conectar " + error)
    })
// PUBLIC

// define o caminho dos arquivos estaticos
app.use(express.static(path.join(__dirname, "public")))

// ROTAS

//  ;rota admin

app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean()
    .then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    }) 

})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).populate("categoria").lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", {postagem: postagem, categoria: postagem.categoria})
        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect("/")
        }
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get("/categorias/", (req, res) => {
    Categoria.find().lean()
    .then((categorias) => {
        res.render("categorias", {categorias: categorias})
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro interno ao lista as categorias")
        res.redirect("Página inicial")
    })
})

app.get("/404", (req, res) => {
    res.send("Erro 404!")
})

app.use("/admin", admin)

// EXPRESS PARA RODAR E ESCUTAR A PORTA DEFINIDA

const PORT = "8081"

app.listen(PORT, () => {
    console.log("== Server rodando ==")
})