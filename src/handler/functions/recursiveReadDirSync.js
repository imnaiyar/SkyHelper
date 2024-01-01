const { readdirSync, lstatSync } = require('fs');
const { join, extname } = require('path');
module.exports = (dir, allowedExtensions = ['.js']) => {
  const filePaths = [];
  const readCommands = (dir) => {
    const files = readdirSync(join(process.cwd(), dir));
    files.forEach((file) => {
      const stat = lstatSync(join(process.cwd(), dir, file));
      if (stat.isDirectory() && stat !== 'prefix') {
        readCommands(join(dir, file));
      } else {
        const extension = extname(file);
        if (!allowedExtensions.includes(extension)) return;
        const filePath = join(process.cwd(), dir, file);
        filePaths.push(filePath);
      }
    });
  };
  readCommands(dir);
  return filePaths;
};
