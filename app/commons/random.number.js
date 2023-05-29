// This file creates random number between 1000 to 9999 
exports.randomNumber = (min, max) => {
    return Math.floor(
        Math.random() * (max - min) + min
    );
}