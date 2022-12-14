const fs=require('fs');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const Tour= require(`${__dirname}/../../models/tourModel`);
const Review= require(`${__dirname}/../../models/reviewModel`);
const User= require(`${__dirname}/../../models/userModels`);

dotenv.config({path :'./../../config.env'});

// DB Connection
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB,{
        useNewUrlParser: true,
        useCreateIndex:  true,
        useUnifiedTopology:true,
        useFindAndModify:false
    }).then(conn => console.log('DB connection successfull!'));

// Read Data File
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
    try{
        await Tour.create(tour);
        await Review.create(reviews);
        await User.create(users, { validatBeforeSave: false });
        console.log("Data imported successfully");
    }catch (err){
        console.log(err)
    }
    process.exit();
}

const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log("Data deleted successfully");
    }catch (err){
        console.log(err)
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}