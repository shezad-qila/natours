const mongoose=require('mongoose');
const crypto = require('crypto');
const dotenv=require('dotenv');
dotenv.config({path :'./config.env'});

const DB = process.env.DATABASE_LOCAL2.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB,{
        useNewUrlParser: true,
        useCreateIndex:  true,
        useUnifiedTopology:true,
        useFindAndModify:false
    }).then(conn => console.log('DB connection successfull!'));

var conn = mongoose.connection;

const resetToken = crypto.randomBytes(8).toString('hex');

const generateToken = async () => {
    await conn.collection('rendomString').deleteOne({});
    await conn.collection('rendomString').insertOne({
        token: resetToken,
        currenTime: Date.now()
    });
}

generateToken();
// console.log('Random String:  ',resetToken);