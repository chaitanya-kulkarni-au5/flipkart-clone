var express = require('express')
var bodyParser = require('body-parser')
var hbs = require('hbs')
var mongodb = require('mongodb')
var multiparty = require('multiparty')
var session = require('express-session')


var app = express()
app.use(express.static('public'))
app.use(express.static('uploads'))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.set('view engine', 'hbs')

var url = 'mongodb://localhost:27017'
var dbname = 'flipkart'
var DB = ''
mongodb.MongoClient.connect(url, function (err, client) {
    if (err) {
        console.log('Failed to connect to mongodb. Error:', err)
    }
    else {
        DB = client.db(dbname)
    }
})

app.use(session({
    secret: 'qwertyuiop',
    cookie: {
        maxAge: 1000 * 60 * 60,
        path: '/',
        httpOnly: true

    }
}))


app.get('/', function (req, res) {
    res.render('login')
})


app.get('/signup', function (req, res) {
    res.render('signup')
})


app.get('/addproduct', function (req, res) {
    res.render('addproduct')
})




app.post('/userlogin', function (req, res) {
    DB.collection('users').findOne({ email: req.body.email }, function (err, result) {
        if (result == null) {
            res.redirect('/?nouser=true')
        }
        else {
            if (req.body.password == result.password) {
                req.session.user = {
                    email: req.body.email
                }
                res.redirect('/home')
            }
            else {
                res.redirect('/?incorrectpassword=true')
            }
        }
    })

})

app.post('/usersignup', function (req, res) {
    DB.collection('users').findOne({ email: req.body.email }, function (err, result) {
        if (result == null) {
            var data = {
                name: req.body.name,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password
            }
            DB.collection('users').insertOne(data, function (err, result) {
                if (err) {
                    console.log('Error Signing up:', err)
                }
                else {
                    res.redirect('/')
                }
            })
        }
        else {
            res.redirect('/signup?alreadyexists=true')
        }
    })

})



////////////////////////// SESSION //////////////////////////////
app.use(function (req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        res.redirect('/?loginfirst=true')
    }
})

app.get('/home', function (req, res) {
    DB.collection('items').find({}).toArray(function (err, items) {
        if (err) {
            console.log(err)
        } {
            DB.collection('users').findOne({email: req.session.user.email}, function (err, email) {
                var dealoftheday = items.filter(function (elem) {
                    return elem.deals == "dealsoftheday"
                })
                var topselection = items.filter(function (elem) {
                    return elem.deals == "topselection"
                })
                res.render('home', {
                    items: items,
                    user: email,
                    dealoftheday: dealoftheday,
                    topselection: topselection
                })
            })
        }

    })

})

app.get('/profile', function (req, res) {
    DB.collection('users').findOne({email: req.session.user.email}, function (err, result) {
        res.render('profile', {
            user: result
        })
    })
    
})

app.post('/product', function (req, res){
    var id = mongodb.ObjectID(req.body.id)
    DB.collection('items').findOne({_id: id}, function(err, result) {
        if(err){
            console.log(err)
        }
        else{
          res.render('product', {
              product: result
          })  
        }
    })
    
})

app.post('/userupdate', function(req, res){
    var data = {
       name: req.body.name,
       lastname: req.body.lastname,
       phone: req.body.phone
    }
    DB.collection('users').updateOne({email: req.session.user.email}, {$set: data}, function (err, result) {
        if(err){
            console.log(err)
        }
        else{
            res.redirect('profile')
        }
      })


})


app.post('/addproduct', function (req, res) {
    var form = new multiparty.Form({ uploadDir: 'uploads' })
    form.parse(req, function (err, fields, files) {
        console.log(fields, files)
        var data = {
            photo: files.photo[0].path.replace('uploads\\', ''),
            name: fields.name[0],
            desc: fields.desc[0],
            price: fields.price[0],
            category: fields.category[0],
            originalprice: fields.originalprice[0],
            rating: fields.rating[0],
            deals: fields.deals[0],
            highlights: fields.highlights,

        }
        DB.collection('items').insertOne(data, function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                res.redirect('/home')
            }
        })
    })
})

app.get('/dotdviewall', function(req, res){
    DB.collection('items').find({deals: 'dealsoftheday'}).toArray(function(err, result){
            if(err){
                console.log(err)
            }
            else{
                res.render('viewall', {
                    items: result
                })
            }

    })
    
})

app.get('/topviewall', function(req, res){
    DB.collection('items').find({deals: 'topselection'}).toArray(function(err, result){
            if(err){
                console.log(err)
            }
            else{
                res.render('viewall', {
                    items: result
                })
            }

    })
    
})


app.get('/logout', function (req, res) {
    req.session.destroy()
    res.redirect('/')
})



app.listen(4500)

