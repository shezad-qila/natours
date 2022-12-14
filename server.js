const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path :'./config.env'});
const app=require('./app');

process.on('uncaughtException', err => {
    // console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB,{
        useNewUrlParser: true,
        useCreateIndex:  true,
        useUnifiedTopology:true,
        useFindAndModify:false
    }).then(conn => console.log('DB connection successfull!'));

const port=process.env.PORT;
const server = app.listen(port,() =>{
    console.log(`App runing on port ${port}`)
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
