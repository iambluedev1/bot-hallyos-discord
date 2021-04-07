const walk = require('../utils/walk');

module.exports = () => {
  return new Promise((resolve) => {
    walk('./src/helpers', function (err, files) {
      if (err) throw err;
      files.forEach((file) => {
        let helper = require(file);
        let fileName = file.split('/helpers/')[1];
        if (!fileName.includes('/')) {
          _.merge(global['hallyos']['helpers'], helper);
        } else {
          let parts = fileName.split('/');
          parts.pop();

          if (parts.join('.').includes('_')) {
            return;
          }

          _.set(
            hallyos.helpers,
            parts.join('.'),
            _.merge(
              _.get(global['hallyos']['helpers'], parts.join('.')),
              helper
            )
          );
        }
        hallyos.log.debug('Loaded helper ' + fileName);
      });
      resolve();
    });
  });
};
