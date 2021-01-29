const fs = require('fs');

const validFlags = ['-c', '-C', '-s', '-S'];

const findFlag = flag => {
  const args = process.argv;
  const index = args.indexOf(flag);

  const value = args[index + 1];

  return Number.isInteger(+value) && +value;
};

const getFlagsList = () => {
  const valC = findFlag('-c') || findFlag('-C');
  const valS = findFlag('-s') || findFlag('-S');

  return { valC, valS };
};

const getFiles = () => {
  const args = process.argv;

  const files = args
    .slice(2)
    .filter(param => !validFlags.includes(param))
    .filter(param => !Number.isInteger(+param));

  return files;
};

const transformFile = file => {
  let { valS } = getFlagsList();

  const rows = fs.readFileSync(file, { encoding: 'utf-8' }).split('\n');

  const bli = rows.sort((a, b) => {
    if (a.length > b.length) return -1;
    if (a.length < b.length) return 1;
    if (a.length == b.length) return 0;
  });

  const automaticValS = bli[0].length;

  valS = !valS ? automaticValS : valS;

  return rows
    .map(row => splitRowInOtherRows(row, valS))
    .flat()
    .map(row => row.padEnd(valS));
};

const splitRowInOtherRows = (row, valS) => {
  let start = 0,
    end = valS;

  let newRows = [];

  for (let i = 0; i <= row.length / valS; i++) {
    const firstrizo = row.slice(start, end);
    start = end;
    end = end + valS;

    newRows = [...newRows, firstrizo];
  }

  return newRows;
};

const compareFiles = () => {
  let { valC } = getFlagsList();

  valC = !valC ? 2 : valC;

  const files = getFiles();

  const transformedFiles = files.map(filePath => transformFile(filePath));

  const mostLongFileLength = transformedFiles.sort((a, b) => {
    if (a.length > b.length) return -1;
    if (a.length < b.length) return 1;
    if (a.length == b.length) return 0;
  })[0].length;

  for (let i = 0; i < mostLongFileLength; i++) {
    let newRow = [];
    for (let j = 0; j < transformedFiles.length; j++) {
      const currentRow = transformedFiles[j][i];
      newRow = [...newRow, currentRow ? currentRow : ''];
    }

    console.log(newRow.join(' '.repeat(valC)));
  }
};

compareFiles();
