const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().then(()=>{
    console.log("MonggoDB Connection Success!")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

const sample = (array) =>{
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<200; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 20) +10 ;
        const camp = new Campground({
            author : '64987390af6d16da71948556',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti nobis quidem libero. Ut, a consectetur dignissimos expedita, alias beatae nemo eum reprehenderit dolor libero, architecto modi neque blanditiis minus ipsum.',
            price : price,
            geometry: { 
                type: 'Point', 
                coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] 
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/dyg9rvav6/image/upload/v1688103838/YelpCamp/tbgmpsg7uyxzl2z78pyk.jpg',
                  filename: 'YelpCamp/tbgmpsg7uyxzl2z78pyk',
                },
                {
                  url: 'https://res.cloudinary.com/dyg9rvav6/image/upload/v1688103838/YelpCamp/rvgcnd0wo2xfzvhbtcwv.jpg',
                  filename: 'YelpCamp/rvgcnd0wo2xfzvhbtcwv',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});