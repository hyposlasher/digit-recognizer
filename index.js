var fs = require('fs');
var gm = require('gm');
var path = require('path');
var junk = require('junk');
var getPixels = require('get-pixels');
var PNG = require('png-js');
var jsonfile = require('jsonfile')
var Promise = require('promise');

const baseFolder = './base';
const resizeFolder = './resized';
const knowledgeFile = './knowledge/data.json';
let knowledge = {};
let numbers = [];

const testedNumber = 9;
var initialTestImage = `./test/${testedNumber}.png`;
var resizedTestImage = `./test/resized/${testedNumber}.png`;


function getArrayOfPixels(file) {
	return new Promise((resolve, reject) => {	
		PNG.decode(file, function(pixels) {
			let array = [];
		  pixels.forEach((pixel, i) => {
		  	if(i % 4 === 0){
		  		array.push(pixel)
		  	}
		  })
		  resolve(array);
		});
	})
}

// изменение размеров картинки
function resizeBaseImages() {
	// return new Promise(resolve => {	
		fs.readdir(baseFolder, (err, files) => {
		  files.forEach((file) => {
		  	if (junk.not(file)) {
		  		resizeImageAndSave(`${baseFolder}/${file}`, `./resized/${file.replace(/\.[^/.]+$/, "")}.png`)
		  	}
		  })
		})
	// })
}

function resizeImageAndSave(file, path) {
	return new Promise(resolve => {	
	  gm(file)
			.resize(10, 10)
			.noProfile()
			.write(path, function (err) {
			  if (!err) {
			  	resolve();
				} else {
					console.log(err)
				}
			});
	})
}

function compare(pattern1, pattern2) {
	var distance = null;
	var sum = 0;
	pattern1.forEach((pix, i) => {
		sum = sum + Math.pow((pattern1[i] - pattern2[i]), 2);
	})
	distance = Math.sqrt(sum);
	return distance;
}

for (let i = 0; i < 10; i++) {
	numbers.push(
		getArrayOfPixels(`./resized/${i}.png`).then(array => {
			return {
				number: `${i}`,
				data: array,
			}
		})
	)
}

// resizeBaseImages();

// Promise.all(numbers)
// 	.then(numbers => {
// 		jsonfile.writeFile(knowledgeFile, numbers, {spaces: 2}, function (err) {
// 		  console.error(err)
// 		})
// 	})
// 	.then(() => {
// 		jsonfile.readFile(knowledgeFile, function(err, obj) {
// 		  knowledge = obj;
// 		})
// 	})


jsonfile.readFile(knowledgeFile, function(err, obj) {
  knowledge = obj;
})


//====> ТЕСТ

resizeImageAndSave(initialTestImage, resizedTestImage)
	.then(() => {
		let testPattern = getArrayOfPixels(resizedTestImage);
		let answer = {
			number: null,
			distance: null,
		};
		testPattern.then(testPattern => {		
			console.dir(knowledge)
			knowledge.forEach((number) => {
				console.dir(number.number)
				let distance = compare(testPattern, number.data);
				console.log('--> distance:', distance);
				if (answer.number === null || distance < answer.distance) {
					answer.number = number.number;
					answer.distance = distance;
				}
			})
			console.log('===>ANSWER:', answer.number )
		})
	})


