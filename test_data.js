// Test script to verify the extracted data
const fs = require('fs');
const path = require('path');

// Read the extracted data
const dataPath = path.join(__dirname, 'public', 'data', 'cutoffs.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Data loaded successfully!');
console.log(`Total records: ${data.length}`);

// Test filtering by year
const year2025 = data.filter(item => item.year === 2025);
console.log(`Records for 2025: ${year2025.length}`);

// Test filtering by category
const gmCategory = data.filter(item => item.category === 'GM');
console.log(`Records for GM category: ${gmCategory.length}`);

// Test filtering by course
const csCourse = data.filter(item => item.branches.code === 'CS');
console.log(`Records for CS course: ${csCourse.length}`);

// Test filtering by college
const e001College = data.filter(item => item.colleges.code === 'E001');
console.log(`Records for E001 college: ${e001College.length}`);

// Show sample record
console.log('\nSample record:');
console.log(JSON.stringify(data[0], null, 2));

// Show unique categories
const categories = [...new Set(data.map(item => item.category))];
console.log('\nUnique categories:', categories);

// Show unique courses
const courses = [...new Set(data.map(item => item.branches.code))];
console.log('\nUnique courses:', courses);

// Show unique colleges
const colleges = [...new Set(data.map(item => item.colleges.code))];
console.log('\nUnique colleges:', colleges.slice(0, 10), '...');

console.log('\nData verification complete!');
