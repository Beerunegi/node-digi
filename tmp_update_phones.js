const fs = require('fs');
const path = require('path');

const viewsDir = 'd:\\node digi\\views';
const oldPhoneNumbers = [/9876543210/g, /7303149572/g];
const newPhoneNumber = '9871264699';

fs.readdirSync(viewsDir).forEach(file => {
    if (file.endsWith('.ejs')) {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        oldPhoneNumbers.forEach(oldRegex => {
            if (oldRegex.test(content)) {
                content = content.replace(oldRegex, newPhoneNumber);
                changed = true;
            }
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${file}`);
        }
    }
});
